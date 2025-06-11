const { mongoose } = require("mongoose");
const { productSchema, ProductModel } = require("../Models/ProductModel");
const { getValidVariant } = require("../Utils/getValidVariant");
const { CartModel } = require("../Models/CartModel");

// add cart data function
const addToCart = async (req, res) => {
  const { cartId } = req.query;
  const { storeId } = req.params;
  const { productId, quantity, selectedVariant } = req.body;

  let cart;

  if (cartId) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ error: "Invalid format of Cart ID" });
    }
    cart = await CartModel.findOne({ _id: cartId, storeRef: storeId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
  } else {
    cart = new CartModel({ storeRef: storeId });
  }

  if (!productId || !quantity) {
    return res.status(400).json({
      message: !quantity ? "Quantity is required" : "Product ID is required",
    });
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Invalid format of Product ID" });
  }

  try {
    const productData = await ProductModel.findById(productId);
    if (!productData) {
      const validProductIds = await ProductModel.find({}, "_id");
      const validIdsSet = new Set(
        validProductIds.map((doc) => doc._id.toString())
      );
      cart.products = cart.products.filter((p) =>
        validIdsSet.has(p.productId?.toString())
      );
      cart.markModified("products");
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      productData?.variations &&
      productData?.variations?.length >= 1 &&
      !selectedVariant
    ) {
      return res.status(400).json({
        message: "selected Variant is required",
      });
    }

    const isSameVariant = (v1, v2) => {
      const keys1 = Object.keys(v1);
      const keys2 = Object.keys(v2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every((k) => v1[k] === v2[k]);
    };

    const existingProduct = cart.products.find(
      (p) =>
        p.productId?.toString() === productId &&
        isSameVariant(p.selectedVariant, selectedVariant)
    );

    const maximumStock = getValidVariant(productData, selectedVariant);

    const maxQty = maximumStock?.stock ?? 0;

    if (!maxQty) {
      return res
        .status(400)
        .json({ message: "Invalid quantity or stock not available" });
    }

    console.log(existingProduct);
    const totalQuantity = existingProduct
      ? existingProduct.quantity + quantity
      : quantity;

    if (totalQuantity > maxQty) {
      return res.status(400).json({
        message: `Only ${maxQty} item(s) availaible in stock`,
      });
    }

    if (existingProduct) {
      existingProduct.quantity = Math.max(1, totalQuantity);
    } else {
      cart.products.push({
        productId,
        quantity: Math.max(1, quantity),
        selectedVariant: selectedVariant || {},
      });
    }

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// get cart data function
const getCartdata = async (req, res) => {
  const { cartId } = req.query;
  const { storeId } = req.params;

  try {
    if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
      return res
        .status(400)
        .json({ error: "Cart ID is undefined or invalid format" });
    }

    const cart = await CartModel.findOne({ _id: cartId, storeRef: storeId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

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
          productId: item._id,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant,
          name: productData.name,
          price: productDataAccToVariant.price,
          image: productDataAccToVariant.image,
        };
      })
    );

    const validProducts = enrichedProducts.filter((p) => p !== null);

    return res.status(200).json({
      cartId: cart.cartId,
      products: validProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete cart product
const deleteCartProduct = async (req, res) => {
  const productId = req.query.productId;
  const id = req.query.id;
  const type = req.collectionType;

  try {
    const CartModel = mongoose.model(
      type + "_Cart",
      CartSchema,
      type + "_Cart"
    );
    if (!productId) {
      const cart = await CartModel.findOneAndDelete({ cartId: id });
      return res.status(200).json(!cart ? [] : cart);
    } else if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const cart = await CartModel.findOne({ cartId: id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    cart.products.splice(productIndex, 1);

    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCartdata, deleteCartProduct };
