import express from "express";
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";
const router = express.Router();

//Get All Products
router.get("/", getAllProducts);
//Get Product
router.get("/find/:id", getProduct);
//Create Product
router.post("/", createProduct);
//Update Product
router.put("/:id", updateProduct);
//Delete Product
router.delete("/:id", deleteProduct);

export default router;
