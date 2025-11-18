import express from "express";
import {
  getAllOrders,
  getUserOrder,
  deleteOrder,
  createOrder,
  updateOrder,
} from "../controller/order.controller.js";
import protect from "../middleware/auth.middleware.js";
const router = express.Router();

// Create Order Route
router.post("/", createOrder);
// Update Order Route
router.put("/:id", updateOrder);
// Get All Orders Route
// router.get("/", protect, getAllOrders);
router.get("/", getAllOrders);
// Delete Order Route
router.delete("/:id", deleteOrder);
// Get User's Order Route
router.get("/find/:id", getUserOrder);

export default router;
