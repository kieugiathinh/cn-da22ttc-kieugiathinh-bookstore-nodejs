import express from "express";
import {
  createFlashSale,
  addProductToFlashSale,
  getActiveFlashSale,
  getAllFlashSales,
  deleteFlashSale,
  updateFlashSale,
  removeProductFromFlashSale,
} from "../controller/flashsale.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: Ai cũng xem được sale đang chạy
router.get("/active", getActiveFlashSale);

// Admin: Mới được tạo và thêm sản phẩm
// router.get("/all", protect, admin, getAllFlashSales);
// router.post("/", protect, admin, createFlashSale);
// router.post("/:id/add-product", protect, admin, addProductToFlashSale);
// router.delete("/:id", protect, admin, deleteFlashSale);

router.get("/all", getAllFlashSales);
router.post("/", createFlashSale);
router.post("/:id/add-product", addProductToFlashSale);
router.delete("/:id", deleteFlashSale);
router.put("/:id", updateFlashSale);
router.delete("/:id/remove-product/:productId", removeProductFromFlashSale);

export default router;
