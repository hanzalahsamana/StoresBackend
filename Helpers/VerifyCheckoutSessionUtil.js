// utils/checkout/verifyCheckoutSession.js

const { CheckoutModel } = require("../Models/CheckoutModel");
const { enrichedAndValidateProducts } = require("./EnrichedAndValidateProducts");


const verifyCheckoutSessionUtil = async (checkoutToken) => {
  if (!checkoutToken) {
    return {
      success: false,
      statusCode: 400,
      message: "Checkout token is required",
      checkoutId: null,
      cartItems: [],
      errors: [],
    };
  }

  // 1️⃣ Find Checkout Session
  const checkout = await CheckoutModel.findOne({ token: checkoutToken, status: "open" });
  if (!checkout) {
    return {
      success: false,
      statusCode: 404,
      message: "Checkout session not found or expired",
      checkoutId: null,
      cartItems: [],
      errors: [],
    };
  }

  const validatedProducts = await enrichedAndValidateProducts(checkout.cart.products);

  const errors = [];
  const cleanedProducts = [];

  validatedProducts.forEach((p, idx) => {
    const originalProduct = checkout.cart.products[idx];

    if (!p.success) {
      if (p.code === "Product_Not_Found") {
        errors.push({ message: `We have deleted the product because it is no more available.` });
      } else if (
        p.code === "Varient_Not_Available" ||
        p.code === "Variant_Required" ||
        p.code === "Variant_Missing" ||
        p.code === "Variant_Invalid"
      ) {
        errors.push({ message: `We have deleted the product because the selected variant is no longer available or invalid.` });
      } else if (p.code === "Sold_Out") {
        errors.push({ message: `We have deleted the product because it is sold out.` });
      } else if (p.code === "Quantity_Exceeded") {
        errors.push({
          message: `We have decreased the quantity of product because only ${p.availableStock} are in stock.`,
        });

        cleanedProducts.push({
          ...originalProduct,
          quantity: p.availableStock,
        });
      }
    } else {
      cleanedProducts.push(originalProduct);
    }
  });

  return {
    success: true,
    statusCode: 200,
    message: "Checkout session verified successfully",
    checkoutId: checkout._id,
    cartItems: cleanedProducts,
    errors,
  };
};

module.exports = {verifyCheckoutSessionUtil};
