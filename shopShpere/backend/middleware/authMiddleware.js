import jwt from "jsonwebtoken";
import User from "../models/User.js";

// PROTECT ROUTES
export const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    let token;

    // 1. Check HTTP-only cookie first, then Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    // Fetch fresh user from DB (so role and status are always accurate)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token has expired. Please login again."
          : "Invalid or expired token"
    });
  }
};

// ADMIN AUTHORIZATION
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
};