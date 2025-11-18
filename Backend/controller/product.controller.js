import Product from "../models/product.model.js";
import asyncHandler from "express-async-handler";

//Create Product
const createProduct = asyncHandler(async (req, res) => {
  const newProduct = await Product(req.body);

  const product = newProduct.save();

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Product was not created");
  }
});

//Update product
const updateProduct = asyncHandler(async (req, res) => {
  const updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    {
      new: true,
    }
  );

  if (!updateProduct) {
    res.status(400);
    throw new Error("Product has not updated");
  } else {
    res.status(201).json(updateProduct);
  }
});

//Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product was not deleted");
  } else {
    res.status(201).json("Product deleted successfully");
  }
});

//Get Product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  } else {
    res.status(201).json(product);
  }
});

// Get All Products
const getAllProducts = asyncHandler(async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;
  let products;

  if (qNew) {
    products = await Product.find().sort({ createAt: -1 });
  } else if (qCategory) {
    products = await Product.find().sort({ categories: { $in: [qCategory] } });
  } else if (qSearch) {
    products = await Product.find({
      $text: {
        $search: qSearch,
        $caseSensitive: false,
        $diacriticSensitive: false,
      },
    });
  } else {
    products = await Product.find().sort({ createAt: -1 });
  }
  res.status(200).json(products);
});

//Rating Product
// const ratingProduct = asyncHandler(async (req, res) => {
//   const { star, name, comment, postedBy } = req.body;

//   if (star) {
//     await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         $push: { ratings: { star, name, comment, postedBy } },
//       },
//       {
//         new: true,
//       }
//     );
//     res.status(201).json("product was rated successfully");
//   } else {
//     res.status(400);
//     throw new Error("product was not rated successfully");
//   }
// });

const ratingProduct = asyncHandler(async (req, res) => {
  const { star, name, comment, postedBy } = req.body;

  // Sửa lại điều kiện kiểm tra
  if (!star || star < 1 || star > 5) {
    // <-- SỬA LẠI DÒNG NÀY
    res.status(400);
    throw new Error("Star rating is required and must be between 1 and 5");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $push: { ratings: { star, name, comment, postedBy } } },
    { new: true }
  );

  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(201).json({ message: "Product was rated successfully" }); // Trả về JSON để nhất quán
});

export {
  ratingProduct,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
