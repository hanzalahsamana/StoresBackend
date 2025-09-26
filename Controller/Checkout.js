const mongoose = require('mongoose');
const { createCheckoutSession } = require('../Utils/CreateCheckoutSession');
const { CartModel } = require('../Models/CartModel');
const { enrichedAndValidateProducts } = require('../Helpers/EnrichedAndValidateProducts');
const { ProductModel } = require('../Models/ProductModel');
const { CheckoutModel } = require('../Models/CheckoutModel');
const { verifyCheckoutSessionUtil } = require('../Helpers/VerifyCheckoutSessionUtil');

const startCheckout = async (req, res) => {
  try {
    const { cartId, cartItems } = req.body;
    const { storeId } = req.params;

    let products = [];

    // ✅ CASE 1: If cartId is provided → fetch from DB
    if (cartId) {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ success: false, message: 'Invalid cart ID' });
      }

      const cart = await CartModel.findOne({ _id: cartId, storeRef: storeId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      products = cart.products;
    }

    // ✅ CASE 2: If cartItems provided directly (Buy Now)
    else if (Array.isArray(cartItems) && cartItems.length > 0) {
      products = cartItems;
    } else {
      return res.status(400).json({ success: false, message: 'No cart data provided' });
    }

    const validatedProducts = await enrichedAndValidateProducts(products);

    const errors = [];
    const cleanedProducts = [];
    const checkoutItems = [];

    validatedProducts.forEach((p, idx) => {
      const originalProduct = products[idx];

      if (!p.success) {
        if (p.code === 'Product_Not_Found') {
          errors.push({ message: `We have deleted the product because it is no more available.` });
        } else if (p.code === 'Varient_Not_Available' || p.code === 'Variant_Required' || p.code === 'Variant_Missing' || p.code === 'Variant_Invalid') {
          errors.push({ message: `We have deleted the product because the selected variant is no longer available or invalid.` });
        } else if (p.code === 'Sold_Out') {
          errors.push({ message: `We have deleted the product because it is sold out.` });
        } else if (p.code === 'Quantity_Exceeded') {
          errors.push({
            message: `We have decreased the quantity of product because only ${p.availableStock} are in stock.`,
          });

          cleanedProducts.push(p);
          checkoutItems.push({
            ...originalProduct,
            quantity: p.availableStock,
          });
        }
      } else {
        console.log(originalProduct);

        cleanedProducts.push(p);
        checkoutItems.push(originalProduct);
      }
    });

    if (!cleanedProducts?.length || !checkoutItems.length) {
      throw new Error('No valid items available for checkout.');
    }
    const checkout = await createCheckoutSession({
      cartItems: checkoutItems,
      storeRef: storeId,
    });

    return res.status(201).json({
      success: true,
      token: checkout.token,
      checkoutId: checkout._id,
      errors: errors,
      cartItems: cleanedProducts,
      message: 'Checkout session created successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const verifyCheckoutSession = async (req, res) => {
  try {
    const { checkoutToken } = req.params;
    const result = await verifyCheckoutSessionUtil(checkoutToken);

    return res.status(result.statusCode).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { startCheckout, verifyCheckoutSession };
