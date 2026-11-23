
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required"
      });
    }

    const qty = Number(quantity ?? 1);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    const existingQuantity =
      itemIndex > -1 ? cart.items[itemIndex].quantity : 0;

    if (existingQuantity + qty > product.stock) {
      return res.status(400).json({
        message: "Not enough stock available"
      });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.status(200).json({
      message: "Product added to cart successfully",
      cart: updatedCart
    });

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id
    }).populate("items.product");

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: {
          items: []
        }
      });
    }

    res.status(200).json({ cart });

  } catch (error) {
    console.error("GET CART ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

// UPDATE CART QUANTITY
export const updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        message: "Not enough stock available"
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found in cart"
      });
    }

    item.quantity = qty;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.status(200).json({
      message: "Cart quantity updated successfully",
      cart: updatedCart
    });

  } catch (error) {
    console.error("UPDATE CART ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

// REMOVE PRODUCT FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const oldLength = cart.items.length;

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    if (oldLength === cart.items.length) {
      return res.status(404).json({
        message: "Product not found in cart"
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Product removed from cart",
      cart
    });

  } catch (error) {
    console.error("REMOVE CART ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart
    });

  } catch (error) {
    console.error("CLEAR CART ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};