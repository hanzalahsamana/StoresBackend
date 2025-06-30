const { mongoose } = require('mongoose');
const { orderSchema, OrderModel } = require('../Models/OrderModal');
const { customerOrderDetail, adminOrderDetail } = require('../Helpers/EmailsToSend');
const { UserModal } = require('../Models/userModal');
const { ConfigurationModel } = require('../Models/ConfigurationModel');
const { CartModel } = require('../Models/CartModel');
const { getValidGlobalDiscount, getValidCouponDiscount } = require('../Helpers/getValidDiscount');
const EnrichedCartProducts = require('../Helpers/EnrichedCartProducts');

const placeOrder = async (req, res) => {
  const { storeId } = req.params;
  const { cartId, customerInfo, paymentInfo, couponCode = null } = req.body;

  try {
    const config = await ConfigurationModel.findOne({
      storeRef: storeId,
    }).lean();

    if (!config) {
      return res.status(404).json({ message: 'Store configuration not found.' });
    }

    const cart = await CartModel.findOne({
      storeRef: storeId,
      _id: cartId,
    }).lean();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found.' });
    }

    // 1. ✅ Validate payment method

    const isPaymentMethodAvailable = config.paymentMethods.some((m) => m.method === paymentInfo.method && m.isEnabled === true);

    if (!isPaymentMethodAvailable) {
      return res.status(400).json({ message: 'Payment method not supported.' });
    }

    // 4. ✅ Fetch cart and populate product details
    // const cart = await Cart.findById(cartId).populate("items.productId");

    // 5. ✅ Build orderItems & check product availability
    const orderItems = [];
    let subTotal = 0;

    const totalProductCost = Array.isArray(cartData) ? cartData.reduce((total, product) => total + product.price * product.quantity, 0) : 0;
    const enrichedCartData = EnrichedCartProducts(cart);
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(400).json({ message: 'Product not found in cart.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Update subtotal
      const itemTotal = product.price * item.quantity;
      subTotal += itemTotal;

      // Build order item
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant,
      });
    }

    // 2. ✅ Validate discount (optional)
    // const globalDiscount = discounts?.find((d) => d.discountType === "global");
    const globalDiscount = getValidGlobalDiscount({ discounts: config.discounts, totalAmount: subTotal });
    const couponDiscount = couponCode ? getValidCouponDiscount({ email: customerInfo.email, storeId, couponCode, allDiscounts: config.discounts, totalAmount: subTotal }) : null;

    // 3. ✅ Get tax & shipping from Configuration model
    const tax = config?.tax || 0;
    const shipping = config?.shipping || 0;

    // 6. ✅ Calculate total
    const totalAmount = subTotal - discountAmount + tax + shipping;

    // 7. ✅ Create order
    const newOrder = await OrderModel.create({
      customerInfo,
      orderItems,
      paymentInfo: {
        ...paymentInfo,
        status: 'unpaid',
      },
      discount: discountAmount,
      tax,
      shipping,
      totalAmount,
      status: 'pending',
      storeRef: storeId,
    });

    // 8. ✅ Optionally create customer record
    const existingCustomer = await CustomerModel.findOne({
      storeRef: storeId,
      email: customerInfo.email,
    });

    if (!existingCustomer) {
      await CustomerModel.create({
        storeRef: storeId,
        ...customerInfo,
      });
    }

    // 9. ✅ If COD, trigger email
    if (paymentInfo.method === 'cod') {
      await sendOrderConfirmationEmail(customerInfo.email, newOrder);
    }

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error('❌ Place Order Error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// get orders
const getOrders = async (req, res) => {
  const type = req.collectionType;
  const orderId = req.query.orderId;
  if (orderId) {
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'Invalid id OR id is not defined' });
    }
  }
  try {
    const OrderModel = mongoose.model(type + '_Orders', orderSchema, type + '_Orders');
    if (!orderId) {
      const orderData = await OrderModel.find({});
      return res.status(201).json(orderData);
    }
    const orderData = await OrderModel.findById(orderId);
    if (!orderData) {
      return res.status(404).json({ message: 'Order Data not found' });
    }

    return res.status(201).json(orderData);
  } catch (e) {
    return res.status(500).json({ message: Object.values(e.errors)[0] });
  }
};

// edit orders

const editOrderData = async (req, res) => {
  const orderId = req.query.id;
  const updateData = req.body;
  const type = req.collectionType;

  if (!mongoose.isValidObjectId(orderId) || !updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      message: !mongoose.isValidObjectId(orderId) ? 'ID is required or Invalid ID' : 'Data is required',
    });
  }

  try {
    const OrderModel = mongoose.model(type + '_Orders', orderSchema, type + '_Orders');

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found!' });
    }

    if (updateData.status) {
      order.orderInfo.status = updateData.status;
    }
    Object.assign(order, updateData);

    await order.save();

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { placeOrder, getOrders, editOrderData };
