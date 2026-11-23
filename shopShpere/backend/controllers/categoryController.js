
import Category from "../models/Category.js";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required"
      });
    }

    const existing = await Category.findOne({ name });

    if (existing) {
      return res.status(409).json({
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      message: "Category created successfully",
      category
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      count: categories.length,
      categories
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json({ category });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json({
      message: "Category deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};