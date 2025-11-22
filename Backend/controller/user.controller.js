import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

// Update User
const updateUser = asyncHandler(async (req, res) => {
  if (req.body.role && req.user.role !== 1) {
    delete req.body.role;
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng để cập nhật");
  } else {
    res.status(200).json(updatedUser);
  }
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng để xóa");
  } else {
    res.status(200).json({ message: "Xóa người dùng thành công" });
  }
});

// Get One User
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Người dùng không tồn tại");
  } else {
    res.status(200).json(user);
  }
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select("-password");

  if (!users) {
    res.status(404);
    throw new Error("Không lấy được danh sách người dùng");
  } else {
    res.status(200).json(users);
  }
});

export { getAllUsers, getUser, deleteUser, updateUser };
