const { mongoose } = require("mongoose");
const { CartSchema } = require("../Models/CartModal");
const { productSchema } = require("../Models/ProductModal");

// add cart data function
const addCarts = async (req, res) => {
  const id = req.query.id;
  const type = req.collectionType;
  const { _id: productId, quantity, selectedSize } = req.body;
  
  
  if (!productId || !quantity || !selectedSize) {
    return res.status(400).json({
      message: `${
        !quantity
        ? "Quantity is required"
          : !productId
          ? "Product ID is required"
          : "Size is required"
      }`,
    });
  }
  
  console.log("okk");
  try {
    const CartModel = mongoose.model(
      type + "_Cart",
      CartSchema,
      type + "_Cart"
    );

    const ProductModel = mongoose.model(
      type + "_products",
      productSchema,
      type + "_products"
    );

    let cart;
    if (id) {
      cart = await CartModel.findOne({ cartId: id });
    }
    if (!cart) {
      cart = new CartModel();
    }

    const productInCart = cart.products.find(
      (p) => p._id?.toString() === productId && p.selectedSize === selectedSize
    );

    if (productInCart) {
      productInCart.quantity += quantity;
      if (productInCart.quantity < 1) {
        productInCart.quantity = 1;
      }
      cart.markModified("products");
    } else {
      const productData = await ProductModel.findById(productId);
      if (!productData) {
        return res.status(404).json({ message: "Product not found" });
      }

      cart.products.push({
        ...productData.toObject(),
        quantity: quantity < 1 ? 1 : quantity,
        selectedSize,
      });
    }

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//updateCart data
// const UpdateCart = async (req, res) => {
//   const cartId = req.params.cartId;
//   const type = req.collectionType;
//   const { _id: productId, quantity, selectedSize } = req.body;

//   console.log(cartId , type , "ohhh");
  

//   if (!productId || (!quantity  && quantity !== 0 ) || !selectedSize) {
//     return res.status(400).json({
//       message: `${
//         !quantity
//           ? "Quantity is required"
//           : !productId
//           ? "Product ID is required"
//           : "Size is required"
//       }`,
//     });
//   }

//   try {
//     const CartModel = mongoose.model(
//       type + "_Cart",
//       CartSchema,
//       type + "_Cart"
//     );

//     if (!cartId) {
//       return res.status(404).json({ message: "Cart Id Not Found" });
//     }

//     const cartData = await CartModel.findOne({ cartId: cartId });

//     if (!cartData) {
//       return res.status(404).json({ message: "Cart Id is incorrect" });
//     }
//     console.log("error");

//     const productInCart = cartData.products.find(
//       (p) => p._id?.toString() === productId && p.selectedSize === selectedSize
//     );
//     console.log("error0");

//     if (!productInCart) {
//       console.log("error1");
//       return res.status(404).json({ message: "Product not found In Cart" });
//     }
//     console.log("error2");
    
//     productInCart.quantity += quantity;
//     productInCart.selectedSize = selectedSize;
//     if (productInCart.quantity < 1) {
//       productInCart.quantity = 1;
//     }
//     console.log("error3");
//     cartData.markModified("products");
    
//     await cartData.save();
//     console.log("error4");
//     return res.status(200).json(cartData);
//   } catch (error) {
//     console.log("error5");
    
//     res.status(500).json({ message: error.message });
//   }
// };

// get cart data function
const getCartData = async (req, res) => {
  const id = req.query.id;
  const type = req.collectionType;
  try {
    const CartModel = mongoose.model(
      type + "_Cart",
      CartSchema,
      type + "_Cart"
    );
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const cartData = await CartModel.find({ cartId: id });

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
