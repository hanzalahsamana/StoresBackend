const { isEqual } = require('lodash');
const { ProductModel } = require('../Models/ProductModel');

const enrichedAndValidateProducts = async (products) => {
  const enrichedProducts = await Promise.all(
    products.map(async (item) => {
      const product = await ProductModel.findById(item.productId).lean();

      if (!product || product.status !== 'active') {
        return { success: false, code: 'Product_Not_Found', message: 'Product not available' };
      }

      let finalPrice = product.price;
      let finalStock = product.stock || 0;
      let finalImage = product.displayImage;
      let matchedVariant = null;

      const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
      const hasVariations = Array.isArray(product.variations) && product.variations.length > 0;

      // ✅ STEP 1: Validate selectedVariant against product.variations (if they exist)
      if (hasVariations) {
        if (!item.selectedVariant || Object.keys(item.selectedVariant).length === 0) {
          return { success: false, code: 'Variant_Required', message: 'Variant selection is required' };
        }

        // check if each selected key & value is valid
        for (const variation of product.variations) {
          const selectedValue = item.selectedVariant[variation.name];
          if (!selectedValue) {
            return { success: false, code: 'Variant_Missing', message: `Missing selection for ${variation.name}` };
          }
          if (!variation.options.includes(selectedValue)) {
            return { success: false, code: 'Variant_Invalid', message: `${selectedValue} is not a valid option for ${variation.name}` };
          }
        }
      } else {
        // product has no variations, selectedVariant must be empty/null
        if (item.selectedVariant && Object.keys(item.selectedVariant).length > 0) {
          return { success: false, code: 'Variant_Not_Allowed', message: 'Invalid variant for non-variation product' };
        }
      }

      // ✅ STEP 2: Variant Matching (only if variants exist)
      if (hasVariants) {
        matchedVariant = product.variants.find((variant) => {
          const variantOptions = variant.options instanceof Map ? Object.fromEntries(variant.options) : variant.options;
          return isEqual(variantOptions, item.selectedVariant || {});
        });

        if (!matchedVariant) {
          return { success: false, code: 'Variant_Not_Available', message: 'Selected variant not available' };
        }

        finalPrice = matchedVariant.price;
        finalStock = matchedVariant.stock;
        finalImage = matchedVariant.image || product.displayImage;
      }

      // ✅ STEP 3: Stock validation
      if (finalStock <= 0) {
        return { success: false, code: 'Sold_Out', message: 'Out of stock' };
      }

      if (item.quantity > finalStock) {
        return { success: false, code: 'Quantity_Exceeded', message: 'Requested quantity exceeds stock', availableStock: finalStock };
      }

      return {
        success: true,
        productId: item.productId,
        quantity: item.quantity,
        availableStock: finalStock,
        price: finalPrice,
        image: finalImage,
        name: product.name,
        selectedVariant: item.selectedVariant,
      };
    })
  );

  return enrichedProducts;
};

const updateProductStock = async (cartProducts) => {
  for (const item of cartProducts) {
    const product = await ProductModel.findById(item.productId);

    if (!product) continue; // product deleted after checkout

    // ✅ CASE 1: If product has variants and matched variant
    if (Array.isArray(product.variants) && product.variants.length > 0 && item.selectedVariant) {
      const matchedVariant = product.variants.find((variant) => {
        const variantOptions = variant.options instanceof Map ? Object.fromEntries(variant.options) : variant.options;
        return _.isEqual(variantOptions, item.selectedVariant);
      });

      if (matchedVariant) {
        // Deduct from variant stock
        matchedVariant.stock = Math.max(0, matchedVariant.stock - item.quantity);
      }
    }

    // ✅ Deduct from global product stock
    if (product.trackInventory) {
      product.stock = Math.max(0, (product.stock || 0) - item.quantity);
    }

    await product.save();
  }
};


module.exports = { enrichedAndValidateProducts , updateProductStock };
