
import express from "express";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.patch("/update/:productId", protect, updateCartQuantity);
router.delete("/remove/:productId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;