
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Allowed fields for product updates
const allowedFields = [
  "name",
  "description",
  "price",
  "category",
  "stock",
  "image"
];

// Check valid MongoDB ID
const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Handle errors
const handleError = (res, error) => {
  console.error("Product API Error:", error);

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Product already exists"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      image
    } = req.body;

    // Required field validation
    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price and category are required"
      });
    }

    // Price validation
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number"
      });
    }

    // Stock validation
    if (
      stock !== undefined &&
      (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer"
      });
    }

    // Category ID validation
    if (!isValidId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    // Check category
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      ...(stock !== undefined && { stock: Number(stock) }),
      image
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (error) {
    return handleError(res, error);
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    return handleError(res, error);
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(id)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    return handleError(res, error);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // Only allow specific fields
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    // Validate name
    if (
      updateData.name !== undefined &&
      (typeof updateData.name !== "string" || !updateData.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name cannot be empty"
      });
    }

    if (updateData.name !== undefined) {
      updateData.name = updateData.name.trim();
    }

    // Validate description
    if (
      updateData.description !== undefined &&
      (typeof updateData.description !== "string" ||
        !updateData.description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty"
      });
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description.trim();
    }

    // Validate price
    if (updateData.price !== undefined) {
      if (
        !Number.isFinite(Number(updateData.price)) ||
        Number(updateData.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product price"
        });
      }

      updateData.price = Number(updateData.price);
    }

    // Validate stock
    if (updateData.stock !== undefined) {
      if (
        !Number.isInteger(Number(updateData.stock)) ||
        Number(updateData.stock) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative integer"
        });
      }

      updateData.stock = Number(updateData.stock);
    }

    // Validate category
    if (updateData.category !== undefined) {
      if (!isValidId(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID"
        });
      }

      const categoryExists = await Category.findById(
        updateData.category
      );

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    return handleError(res, error);
  }
};
