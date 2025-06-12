const { ProductModel } = require("../Models/ProductModel");
const { getValidVariant } = require("../Utils/getValidVariant");

const EnrichedCartProducts = async (cart) => {
  const enrichedProducts = await Promise.all(
    cart.products.map(async (item) => {
      const productData = await ProductModel.findById(item.productId).lean();

      if (!productData) {
        return null;
      }

      const productDataAccToVariant = getValidVariant(
        productData,
        item?.selectedVariant
      );

      return {
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant,
        name: productData.name,
        price: productDataAccToVariant.price,
        image: productDataAccToVariant.image,
      };
    })
  );

  const validProducts = enrichedProducts.filter((p) => p !== null);
  return {
    _id: cart?._id,
    storeRef: cart?.storeRef,
    products: validProducts,
  };
};

module.exports = EnrichedCartProducts;
