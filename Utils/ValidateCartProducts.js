const { isMatch } = require('lodash');
const { ProductModel } = require('../Models/ProductModel');

// Utils/validateCartProducts.js
const validateCartProducts = async (cartItem) => {
  const product = await ProductModel.findById(cartItem.productId).lean();

  // Base product validation
  if (!product || product.status !== 'active') {
    return { valid: false, reason: 'Product not available' };
  }

  let finalPrice = product.price;
  let finalStock = product.stock || 0;
  let finalImage = product.displayImage;
  let matchedVariant = null;

  // CASE 1: Product has variants
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    matchedVariant = product.variants.find((variant) => {
      const variantOptions = variant.options instanceof Map ? Object.fromEntries(variant.options) : variant.options;

      return isMatch(variantOptions, cartItem.selectedVariant || {});
    });

    if (!matchedVariant) {
      return { valid: false, reason: 'Selected variant not available' };
    }

    finalPrice = matchedVariant.price;
    finalStock = matchedVariant.stock;
    finalImage = matchedVariant.image || product.displayImage;
  }

  // CASE 2: Product without variants
  else {
    if (cartItem.selectedVariant && Object.keys(cartItem.selectedVariant).length > 0) {
      return { valid: false, reason: 'Invalid variant for non-variant product' };
    }
  }

  // Stock validation
  if (finalStock <= 0) {
    return { valid: false, reason: 'Out of stock' };
  }

  if (cartItem.quantity > finalStock) {
    return { valid: false, reason: 'Requested quantity exceeds stock', availableStock: finalStock };
  }

  // Return enriched + validated data
  return {
    valid: true,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    availableStock: finalStock,
    price: finalPrice,
    image: finalImage,
    name: product.name,
    selectedVariant: cartItem.selectedVariant,
  };
};

module.exports = { validateCartProducts };
