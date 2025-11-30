import express from "express";
import {
  getAllOrders,
  getUserOrder,
  deleteOrder,
  createOrder,
  updateOrder,
} from "../controller/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// // Create Order Route
// router.post("/", protect, createOrder);

// // Update Order Route
// router.put("/:id", protect, updateOrder);

// // Get All Orders Route
// router.get("/", protect, getAllOrders);

// // Delete Order Route
// router.delete("/:id", protect, deleteOrder);

// // Get User's Order Route
// router.get("/find/:id", protect, getUserOrder);

router.post("/", createOrder);
router.put("/:id", updateOrder);
router.get("/", getAllOrders);
router.delete("/:id", deleteOrder);
router.get("/find/:id", getUserOrder);

export default router;
