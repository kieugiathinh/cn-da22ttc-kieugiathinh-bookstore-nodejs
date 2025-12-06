import Order from "../models/order.model.js";
import asyncHandler from "express-async-handler";

// Create Order
const createOrder = asyncHandler(async (req, res) => {
  // Sửa: Thêm từ khóa 'new'
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400);
    throw new Error("Order could not be created: " + err.message);
  }
});

// Update Order
const updateOrder = asyncHandler(async (req, res) => {
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    {
      new: true,
    }
  );

  if (!updatedOrder) {
    res.status(404); // Sửa thành 404 Not Found
    throw new Error("Order not found");
  } else {
    res.status(200).json(updatedOrder);
  }
});

// Delete Order
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  } else {
    res.status(200).json({ message: "Order has been deleted" });
  }
});

// Get User Order (Sửa nhiều nhất tại đây)
const getUserOrder = asyncHandler(async (req, res) => {
  // 1. Tìm theo userId
  // 2. Sắp xếp giảm dần theo ngày tạo (Mới nhất lên đầu)
  const orders = await Order.find({ userId: req.params.id }).sort({
    createdAt: -1,
  });

  // QUAN TRỌNG: Không throw Error 404 ở đây.
  // Luôn trả về mảng (có thể là mảng rỗng []) với status 200
  res.status(200).json(orders);
});

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  // Sắp xếp mới nhất lên đầu
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(200).json(orders);
});

// Cancel Order (User tự hủy)
// PUT /api/v1/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }

  // 1. Kiểm tra quyền sở hữu (Chỉ chủ đơn hàng mới được hủy)
  // req.user._id lấy từ middleware protect
  if (order.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bạn không có quyền hủy đơn hàng này");
  }

  // 2. QUAN TRỌNG: Kiểm tra trạng thái
  // Chỉ cho hủy khi status === 0 (Chờ xác nhận)
  if (order.status !== 0) {
    res.status(400);
    throw new Error("Đơn hàng đã được xác nhận hoặc đang giao, không thể hủy!");
  }

  // 3. Cập nhật trạng thái thành 3 (Đã hủy)
  order.status = 3;
  const updatedOrder = await order.save();

  res
    .status(200)
    .json({ message: "Hủy đơn hàng thành công", order: updatedOrder });
});

export {
  getAllOrders,
  getUserOrder,
  deleteOrder,
  createOrder,
  updateOrder,
  cancelOrder,
};
