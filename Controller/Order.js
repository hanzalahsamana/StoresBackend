const { mongoose } = require('mongoose');
const { orderSchema, OrderModel } = require('../Models/OrderModal');
const { customerOrderDetail, adminOrderDetail } = require('../Helpers/EmailsToSend');
const { UserModal } = require('../Models/userModal');
const { ConfigurationModel } = require('../Models/ConfigurationModel');
const { CartModel } = require('../Models/CartModel');
const { getValidGlobalDiscount, getValidCouponDiscount } = require('../Helpers/getValidDiscount');
const EnrichedCartProducts = require('../Helpers/EnrichedCartProducts');
const { ProductModel } = require('../Models/ProductModel');
const { getValidVariant } = require('../Utils/getValidVariant');
const { StoreModal } = require('../Models/StoreModal');

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

    if (!cart || cart.products?.length === 0) {
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
    let totalProductCost = 0;

    for (const product of cart.products) {
      console.log(cart, 'Cart Data😂😂😂😂');

      const productData = await ProductModel.findOne({ storeRef: storeId, _id: product.productId }).lean();

      if (!productData) {
        return res.status(400).json({ message: `Product not found with ${product.productId} ID.` });
      }

      const productDataAccToVariant = getValidVariant(productData, product?.selectedVariant);
      if (productData?.trackInventory === true) {
        const maxQty = productDataAccToVariant?.stock ?? 0;

        if (!maxQty) {
          return res.status(400).json({ message: `Stock not available for ${product.name}` });
        }

        if (maxQty < product.quantity) {
          return res.status(400).json({
            message: `Only ${maxQty} item(s) available for ${product.name}`,
          });
        }
      }

      // Update subtotal
      const itemTotal = productDataAccToVariant.price * product.quantity;
      totalProductCost += itemTotal;

      // Build order item
      orderItems.push({
        productId: product.productId,
        name: productData.name,
        quantity: product.quantity,
        selectedVariant: product.selectedVariant,
        image: productDataAccToVariant.image,
        price: productDataAccToVariant.price,
      });
    }

    // 2. ✅ Validate discount (optional)
    const globalDiscount = getValidGlobalDiscount({ discounts: config?.discounts, totalAmount: totalProductCost });
    const couponDiscount = couponCode
      ? await getValidCouponDiscount({
          email: customerInfo.email,
          storeId,
          couponCode,
          allDiscounts: config?.discounts,
          totalAmount: totalProductCost - (globalDiscount?.discountAmount || 0),
        })
      : null;

    // 3. ✅ Get tax & shipping from Configuration model
    const subTotal = totalProductCost - ((globalDiscount?.discountAmount || 0) + (couponDiscount?.discountAmount || 0));
    if (subTotal < 0) {
      return res.status(400).json({ message: 'Total amount cannot be negative after discounts.' });
    }
    const tax = config?.tax || 200;
    const shipping = config?.shipping || 120;

    // 6. ✅ Calculate total
    const totalAmount = subTotal + tax + shipping;

    // 7. ✅ Update order counter in Store model

    const store = await StoreModal.findOneAndUpdate({ _id: storeId }, { $inc: { orderCounter: 1 } }, { new: true });
    const orderNumber = `#${store.orderCounter.toString().padStart(6, '0')}`;

    // 8. ✅ Create order
    const newOrder = await OrderModel.create({
      customerInfo,
      orderItems,
      paymentInfo: {
        ...paymentInfo,
        status: 'unpaid',
      },
      globalDiscount: globalDiscount || null,
      couponDiscount: couponDiscount || null,
      totalProductCost,
      subTotal,
      tax,
      shipping,
      totalAmount,
      status: 'pending',
      orderNumber,
      storeRef: storeId,
    });

    for (const product of cart.products) {
      const productData = await ProductModel.findOne({ storeRef: storeId, _id: product.productId }).lean();

      if (productData?.trackInventory === true) {
        for (const item of orderItems) {
          const { productId, selectedVariant, quantity } = item;

          if (selectedVariant && Object.keys(selectedVariant).length > 0) {
            // Case: Variant selected — update specific variant stock + global stock
            await ProductModel.updateOne(
              {
                _id: productId,
                'variants.options': selectedVariant,
              },
              {
                $inc: {
                  'variants.$.stock': -quantity,
                  stock: -quantity,
                },
              }
            );
          } else {
            // Case: No variant — update only global stock
            await ProductModel.updateOne(
              { _id: productId },
              {
                $inc: { stock: -quantity },
              }
            );
          }
        }
      }
    }
    // 9. ✅ Optionally create customer record
    // const existingCustomer = await CustomerModel.findOne({
    //   storeRef: storeId,
    //   email: customerInfo.email,
    // });

    // if (!existingCustomer) {
    //   await CustomerModel.create({
    //     storeRef: storeId,
    //     ...customerInfo,
    //   });
    // }

    // 10. ✅ If COD, trigger email
    // if (paymentInfo.method === 'cod') {
    //   await sendOrderConfirmationEmail(customerInfo.email, newOrder);
    // }

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
