const { mongoose } = require("mongoose");
const { productSchema, ProductModel } = require("../Models/ProductModel");
const { getValidVariant } = require("../Utils/getValidVariant");
const { CartModel } = require("../Models/CartModel");
const EnrichedCartProducts = require("../Helpers/EnrichedCartProducts");

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

    console.log(existingProduct, "🍭🍭🍭");

    const maximumStock = getValidVariant(productData, selectedVariant);

    const maxQty = maximumStock?.stock ?? 0;

    if (!maxQty) {
      return res
        .status(400)
        .json({ message: "Invalid quantity or stock not available" });
    }

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

    const savedCart = await cart.save();
    const validCart = await EnrichedCartProducts(savedCart);

    return res.status(200).json(validCart);
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

    const validCart = await EnrichedCartProducts(cart);

    return res.status(200).json(validCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete cart product

const deleteCartData = async (req, res) => {
  const { storeId } = req.params;
  const { cartId } = req.query;
  const { cartProductId } = req.query;

  if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
    return res.status(400).json({ message: "undefiened Or Invalid cartId" });
  }

  try {
    const cart = await CartModel.findOne({
      _id: cartId,
      storeRef: storeId,
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cartProductId) {
      await CartModel.findByIdAndDelete(cartId);
      return res.status(200).json({ message: "Cart deleted" });
    }

    if (!mongoose.Types.ObjectId.isValid(cartProductId)) {
      return res.status(400).json({ message: "Invalid cartProductId" });
    }

    const index = cart.products.findIndex(
      (p) => p._id?.toString() === cartProductId
    );

    if (index === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    cart.products.splice(index, 1);
    const savedCart = await cart.save();

    const validCart = await EnrichedCartProducts(savedCart);

    return res.status(200).json(validCart);
  } catch (error) {
    console.error("Delete Cart Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCartdata, deleteCartData };
