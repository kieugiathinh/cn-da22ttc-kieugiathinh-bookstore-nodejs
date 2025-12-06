import Order from "../models/order.model.js";
import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";

// Create Order
const createOrder = asyncHandler(async (req, res) => {
  const { products } = req.body;

  // 1. KIỂM TRA TỒN KHO TRƯỚC (Để tránh bán quá số lượng)
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404);
      throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`);
    }
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(
        `Sản phẩm "${product.title}" không đủ hàng (Còn: ${product.countInStock})`
      );
    }
  }

  // 2. TẠO ĐƠN HÀNG
  const newOrder = new Order(req.body);
  const savedOrder = await newOrder.save();

  // 3. TRỪ TỒN KHO (Sau khi tạo đơn thành công)
  if (savedOrder) {
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { countInStock: -item.quantity }, // Trừ số lượng
      });
    }

    res.status(201).json(savedOrder);
  } else {
    res.status(400);
    throw new Error("Không thể tạo đơn hàng");
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

// Cancel Order
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Kiểm tra quyền (như cũ)
  if (order.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bạn không có quyền hủy đơn hàng này");
  }

  // Chỉ hủy được đơn đang chờ (0)
  if (order.status !== 0) {
    res.status(400);
    throw new Error("Không thể hủy đơn hàng đã xác nhận");
  }

  // --- LOGIC HOÀN KHO (MỚI THÊM) ---
  // Duyệt qua từng sản phẩm trong đơn hàng bị hủy
  for (const item of order.products) {
    // Cộng lại số lượng vào kho
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { countInStock: item.quantity }, // Cộng số lượng
    });
  }
  // --------------------------------

  // Cập nhật trạng thái đơn hàng thành Hủy (3)
  order.status = 3;
  const updatedOrder = await order.save();

  res
    .status(200)
    .json({ message: "Hủy đơn thành công, đã hoàn kho", order: updatedOrder });
});

export {
  getAllOrders,
  getUserOrder,
  deleteOrder,
  createOrder,
  updateOrder,
  cancelOrder,
};
