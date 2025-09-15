// utils/createCheckoutSession.js
const { v4: uuidv4 } = require("uuid");
const { validateCartProducts } = require("./validateCartProducts");
const { CheckoutModel } = require("../Models/CheckoutModel");

async function createCheckoutSession({ cartItems, storeRef }) {
  const validatedItems = [];

  // Validate each cart item before creating checkout


  if (!validatedItems.length) {
    throw new Error("No valid items available for checkout.");
  }

  const token = uuidv4();

  const checkout = await CheckoutModel.create({
    token,
    cartItems: validatedItems,
    storeRef,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
  });

  return checkout;
}

module.exports = { createCheckoutSession };
