import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js"; // <--- BẮT BUỘC IMPORT REVIEW
import asyncHandler from "express-async-handler";

// Create Order
const createOrder = asyncHandler(async (req, res) => {
  const { products } = req.body;

  // 1. KIỂM TRA TỒN KHO
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

  // 3. TRỪ TỒN KHO
  if (savedOrder) {
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { countInStock: -item.quantity, sold: item.quantity },
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
    { $set: req.body },
    { new: true }
  );

  if (!updatedOrder) {
    res.status(404);
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

// --- PHẦN SỬA ĐỔI QUAN TRỌNG NHẤT ---
// Get User Order
const getUserOrder = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // 1. Lấy tất cả đơn hàng của User (Mới nhất lên đầu)
  const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

  // 2. Lấy tất cả Review của User này
  const reviews = await Review.find({ user: userId });

  // 3. Tạo một bộ nhớ tạm (Set) chứa các mã "OrderId-ProductId" đã đánh giá
  // Mục đích: Để tra cứu cực nhanh xem đơn hàng X có sản phẩm Y đã đánh giá chưa
  const reviewedSet = new Set(
    reviews.map((r) => `${r.order?.toString()}-${r.product?.toString()}`)
  );

  // 4. Duyệt qua từng đơn hàng và từng sản phẩm để gắn cờ isReviewed
  const result = orders.map((order) => {
    const orderObj = order.toObject(); // Chuyển Mongoose Doc sang Object thường để chỉnh sửa

    orderObj.products = orderObj.products.map((product) => {
      // Tạo key kiểm tra: ID Đơn hàng + ID Sản phẩm
      const key = `${order._id.toString()}-${product.productId.toString()}`;

      return {
        ...product,
        // Nếu key này tồn tại trong reviewedSet -> Đã đánh giá (true), ngược lại là false
        isReviewed: reviewedSet.has(key),
      };
    });

    return orderObj;
  });

  res.status(200).json(result);
});
// -------------------------------------

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
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

  if (order.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Bạn không có quyền hủy đơn hàng này");
  }

  if (order.status !== 0) {
    res.status(400);
    throw new Error("Không thể hủy đơn hàng đã xác nhận");
  }

  // Hoàn kho
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { countInStock: item.quantity, sold: -item.quantity },
    });
  }

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
