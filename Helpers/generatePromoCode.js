const crypto = require("crypto");

const generatePromoCode = (length = 6) => {
  return crypto
    .randomBytes(length)
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
};

const generateUniquePromoCode = async (model) => {
  let code;
  let exists = true;

  while (exists) {
    code = generatePromoCode();
    exists = await model.exists({ promoCode: code });
  }

  return code;
};

module.exports = { generateUniquePromoCode };
