import express from "express";
import {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} from "../controller/user.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js"; // Import middleware

const router = express.Router();

router.get("/", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id", protect, updateUser);
router.get("/find/:id", getUser);

export default router;
