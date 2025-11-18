import express from "express";
import {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} from "../controller/user.controller.js";
const router = express.Router();

// Get All User
router.get("/", getAllUsers);
// Delete User
router.delete("/:id", deleteUser);
// Update User
router.put("/:id", updateUser);
// Get One User
router.get("/find/:userId", getUser);

export default router;
