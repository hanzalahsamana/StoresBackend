// utils/createCheckoutSession.js
const { v4: uuidv4 } = require('uuid');
const { CheckoutModel } = require('../Models/CheckoutModel');

async function createCheckoutSession({ cartItems, storeRef }) {
  const token = uuidv4();

  const checkout = await CheckoutModel.create({
    token,
    cartItems,
    storeRef,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
  });

  return checkout;
}

module.exports = { createCheckoutSession };
