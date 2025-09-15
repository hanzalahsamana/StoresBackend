const { mongoose } = require('mongoose');
const { productSchema, ProductModel } = require('../Models/ProductModel');
const { getValidVariant } = require('../Utils/getValidVariant');
const { CartModel } = require('../Models/CartModel');
const { isEqual } = require('lodash');
const { enrichedAndValidateProducts } = require('../Helpers/EnrichedAndValidateProducts');

// add cart data function
const addToCart = async (req, res) => {
  const { cartId } = req.query;
  const { storeId } = req.params;
  const { productId, quantity, selectedVariant } = req.body || {};

  try {
    let cart;

    if (cartId) {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: 'Invalid format of Cart ID' });
      }
      cart = await CartModel.findOne({ _id: cartId, storeRef: storeId });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
    } else {
      cart = new CartModel({ storeRef: storeId });
    }

    if (!productId || !quantity) {
      return res.status(400).json({
        message: !quantity ? 'Quantity is required' : 'Product ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid format of Product ID' });
    }

    const existingProduct = cart.products.find((p) => p.productId?.toString() === productId && isEqual(p.selectedVariant || null, selectedVariant || null));
    const totalQuantity = existingProduct ? existingProduct.quantity + quantity : quantity;

    const validatedProduct = await enrichedAndValidateProducts([{ productId, quantity: totalQuantity, selectedVariant }]);

    if (!validatedProduct.length || !validatedProduct[0]?.success) {
      if (
        validatedProduct[0]?.code === 'Product_Not_Found' ||
        validatedProduct[0]?.code === 'Sold_Out' ||
        validatedProduct[0]?.code === 'Varient_Not_Available' ||
        validatedProduct[0]?.code === 'Variant_Missing' ||
        validatedProduct[0]?.code === 'Variant_Invalid' ||
        validatedProduct[0]?.code === 'Variant_Not_Allowed'
      ) {
        cart.products = cart.products.filter((p) => p.productId?.toString() !== productId?.toString());
        cart.markModified('products');
        return res.status(404).json(validatedProduct[0] || { message: 'Something went worng while adding product to cart' });
      }

      if (validatedProduct[0]?.code === 'Quantity_Exceeded') {
        if (existingProduct) {
          existingProduct.quantity = Math.max(1, validatedProduct[0]?.availableStock);
        }
        cart.markModified('products');
        return res.status(404).json(validatedProduct[0] || { message: 'Something went worng while adding product to cart' });
      }
      return res.status(404).json(validatedProduct[0] || { message: 'Something went worng while adding product to cart' });
    }

    if (existingProduct) {
      existingProduct.quantity = Math.max(1, totalQuantity);
    } else {
      cart.products.push({
        productId,
        quantity: Math.max(1, quantity),
        selectedVariant: selectedVariant || null,
      });
    }

    const savedCart = await cart.save();

    return res.status(200).json(savedCart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCartdata = async (req, res) => {
  const { cartId } = req.query;
  const { storeId } = req.params;

  try {
    if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ error: 'Cart ID is undefined or invalid format' });
    }

    const cart = await CartModel.findOne({ _id: cartId, storeRef: storeId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const validatedProducts = await enrichedAndValidateProducts(cart.products);

    const errors = [];
    const cleanedProducts = [];

    validatedProducts.forEach((p, idx) => {
      const originalProduct = cart.products[idx];

      if (!p.success) {
        if (p.code === 'Product_Not_Found') {
          errors.push({ message: `We have deleted the product because it is no more available.` });
        } else if (p.code === 'Varient_Not_Available' || p.code === 'Variant_Required' || p.code === 'Variant_Missing' || p.code === 'Variant_Invalid') {
          errors.push({ message: `We have deleted the product because the selected variant is no longer available or invalid.` });
        } else if (p.code === 'Sold_Out') {
          errors.push({ message: `We have deleted the product because it is sold out.` });
        } else if (p.code === 'Quantity_Exceeded') {
          errors.push({
            message: `We have decreased the quantity of product because only ${p.availableStock} are in stock.`,
          });

          cleanedProducts.push({
            ...originalProduct,
            quantity: p.availableStock,
          });
        }
      } else {
        cleanedProducts.push(originalProduct);
      }
    });

    cart.products = cleanedProducts;
    cart.markModified('products');
    await cart.save();

    return res.status(200).json({
      ...cart,
      success: true,
      products: validatedProducts.filter((p) => p.success), // send only valid enriched products
      errors, // send user-friendly error messages
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete cart product

const deleteCartData = async (req, res) => {
  const { storeId } = req.params;
  const { cartId, cartProductId } = req.query;

  if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) {
    return res.status(400).json({ message: 'Undefined or invalid cartId' });
  }

  try {
    const cart = await CartModel.findOne({ _id: cartId, storeRef: storeId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // 🗑️ CASE 1: Delete entire cart
    if (!cartProductId) {
      await CartModel.findByIdAndDelete(cartId);
      return res.status(200).json({
        success: true,
        products: [],
        errors: [{ message: 'Your entire cart has been deleted.' }],
      });
    }

    // 🗑️ CASE 2: Delete a single product from cart
    if (!mongoose.Types.ObjectId.isValid(cartProductId)) {
      return res.status(400).json({ message: 'Invalid cartProductId' });
    }

    const index = cart.products.findIndex((p) => p._id?.toString() === cartProductId);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }

    // Remove the product
    const removedProduct = cart.products[index];
    cart.products.splice(index, 1);

    cart.markModified('products');
    const savedCart = await cart.save();

    // Revalidate remaining products after deletion
    const validatedProducts = await enrichedAndValidateProducts(savedCart.products);

    const errors = [];
    const cleanedProducts = [];

    validatedProducts.forEach((p, idx) => {
      const originalProduct = savedCart.products[idx];

      if (!p.success) {
        if (p.code === 'Product_Not_Found') {
          errors.push({ message: `We have deleted the product because it is no more available.` });
        } else if (p.code === 'Varient_Not_Available' || p.code === 'Variant_Required' || p.code === 'Variant_Missing' || p.code === 'Variant_Invalid') {
          errors.push({ message: `We have deleted the product because the selected variant is no longer available or invalid.` });
        } else if (p.code === 'Sold_Out') {
          errors.push({ message: `We have deleted the product because it is sold out.` });
        } else if (p.code === 'Quantity_Exceeded') {
          errors.push({
            message: `We have decreased the quantity of product because only ${p.availableStock} are in stock.`,
          });

          cleanedProducts.push({
            ...originalProduct,
            quantity: p.availableStock,
          });
        }
      } else {
        cleanedProducts.push(originalProduct);
      }
    });

    // Save cleaned cart
    cart.products = cleanedProducts;
    cart.markModified('products');
    await cart.save();

    return res.status(200).json({
      ...cart,
      success: true,
      products: validatedProducts.filter((p) => p.success),
      errors: [{ message: `We have deleted product from your cart successfully.` }, ...errors],
    });
  } catch (error) {
    console.error('Delete Cart Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCartdata, deleteCartData };
