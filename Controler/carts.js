const { CartModal } = require("../Models/CartModal");
const { ProductModal } = require("../Models/ProductModal");

const addCarts = async (req, res) => {
  const productId = req.query.productId;
  const id = req.query.id;
  const quantity = req.body.quantity;

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({
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

module.exports = { addCarts };
