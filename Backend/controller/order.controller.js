import Order from "../models/order.model.js";
import asyncHandler from "express-async-handler";

//Create Order
const createOrder = asyncHandler(async (req, res) => {
  const newOrder = Order(req.body);
  const savedOrder = await newOrder.save();

  if (!savedOrder) {
    res.status(400);
    throw new Error("Order was not created");
  } else {
    res.status(201).json(savedOrder);
  }
});

//Update Order
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
    res.status(400);
    throw new Error("Order was not updated");
  } else {
    res.status(201).json(updatedOrder);
  }
});

// Delete Order
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    res.status(400);
    throw new Error("Order was not deleted successfully");
  } else {
    res.status(201).json(order);
  }
});

// Get User Order
const getUserOrder = asyncHandler(async (req, res) => {
  console.log("=== GET USER ORDER DEBUG ===");
  console.log("User ID from params:", req.params.id);
  
  const orders = await Order.find({ userID: req.params.id }).exec();
  console.log("Found orders:", orders.length);
  console.log("Orders data:", orders);

  if (!orders || orders.length === 0) {
    console.log("No orders found for user:", req.params.id);
    res.status(404);
    throw new Error("No orders were found for this user.");
  } else {
    console.log("Returning orders to frontend");
    res.status(200).json(orders.reverse());
  }
});

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  if (!orders) {
    res.status(400);
    throw new Error("No order was not found or something went wrong");
  } else {
    res.status(200).json(orders);
  }
});

export { getAllOrders, getUserOrder, deleteOrder, createOrder, updateOrder };
