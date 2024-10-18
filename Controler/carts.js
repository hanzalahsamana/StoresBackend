const { CartModal } = require("../Models/CartModal");
const { ProductModal } = require("../Models/ProductModal");

// add cart data function
const addCarts = async (req, res) => {
  const productId = req.query.productId;
  const id = req.query.id;
  const quantity = req.body.quantity;

  if (!productId || !quantity) {
    return res.status(400).json({
      message: `${
        !quantity ? "quantity is required" : "Product ID is required"
      }`,
    });
  }
  try {
    let cart;
    if (id) {
      cart = await CartModal.findOne({ cartId: id });
    }
    if (!cart) {
      cart = new CartModal();
    }
    const productInCart = cart.products.find(
      (p) => p._id?.toString() === productId
    );
    if (productInCart) {
      productInCart.quantity = quantity;
      cart.markModified("products");
      await cart.save();
    } else {
      const productData = await ProductModal.findById(productId);
      if (!productData) {
        return res.status(404).json({ message: "Product not found" });
      }
      cart.products.push({
        ...productData.toObject(),
        quantity: quantity,
      });
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// get cart data function
const getCartData = async (req, res) => {
  const id = req.query.id;
  try {
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const cartData = await CartModal.find({ cartId: id });
    
    if (cartData.length === 0) {
      return res.status(400).json({ message: "Data not found" });
    }
    return res.status(200).json(cartData);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

// delete cart product
const deleteCartProduct = async (req, res) => {
  const productId = req.query.productId;
  const id = req.query.id;

  try {
    if (!productId) {
      const cart = await CartModal.deleteOne({ cartId: id });
      return res.status(400).json({
        message: `${cart && "Cart data deleted"}`,
      });
    } else if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const cart = await CartModal.findOne({ cartId: id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (product) => product._id.toString() === productId
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

module.exports = { addCarts, getCartData, deleteCartProduct };
