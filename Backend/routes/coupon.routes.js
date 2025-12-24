import express from "express";
import {
  createCoupon,
  saveCouponToWallet,
  calculateDiscount,
  getAllCoupons,
} from "../controller/coupon.controller.js";

import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// 1. Lấy danh sách mã hiển thị trang chủ
// Route này thường để Public cho mọi người cùng xem
router.get("/", getAllCoupons);

// 2. Admin tạo mã
// Thay verifyTokenAndAdmin thành -> protect, admin (chạy lần lượt)
router.post("/", protect, admin, createCoupon);

// 3. User lưu mã vào ví
// Thay verifyToken thành -> protect
router.post("/save", protect, saveCouponToWallet);

// 4. User check mã khi thanh toán
// Thay verifyToken thành -> protect
router.post("/apply", protect, calculateDiscount);

export default router;
