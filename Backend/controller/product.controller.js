import Product from "../models/product.model.js";
import asyncHandler from "express-async-handler";

// 1. Create Product
const createProduct = asyncHandler(async (req, res) => {
  // Cách viết chuẩn: Product.create() hoặc new Product().save()
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Không thể tạo sản phẩm");
  }
});

// 2. Update Product
// Bạn đang dùng $set: req.body -> RẤT TỐT.
// Nó sẽ tự động cập nhật mọi trường (author, publisher, countInStock...) mà Frontend gửi lên.
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    {
      new: true, // Trả về data mới sau khi update
    }
  );

  if (!updatedProduct) {
    res.status(404); // Dùng 404 Not Found hợp lý hơn 400
    throw new Error("Không tìm thấy sản phẩm để cập nhật");
  } else {
    res.status(200).json(updatedProduct); // Update thành công dùng 200
  }
});

// 3. Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm để xóa");
  } else {
    res.status(200).json({ message: "Đã xóa sản phẩm thành công" });
  }
});

// 4. Get Single Product
const getProduct = asyncHandler(async (req, res) => {
  // QUAN TRỌNG: Thêm .populate("category") để lấy tên thể loại
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại");
  } else {
    res.status(200).json(product);
  }
});

// // 5. Get All Products (Sửa nhiều nhất)
// const getAllProducts = asyncHandler(async (req, res) => {
//   const qNew = req.query.new;
//   const qCategory = req.query.category;
//   const qSearch = req.query.search;
//   let products;

//   try {
//     if (qNew) {
//       // SỬA LỖI CHÍNH TẢ: createAt -> createdAt
//       products = await Product.find()
//         .sort({ createdAt: -1 })
//         .populate("category");
//     } else if (qCategory) {
//       // SỬA LOGIC: Tìm theo ID category duy nhất
//       products = await Product.find({
//         category: qCategory,
//       }).populate("category");
//     } else if (qSearch) {
//       // Tìm kiếm text
//       products = await Product.find({
//         $text: {
//           $search: qSearch,
//           $caseSensitive: false,
//           $diacriticSensitive: false,
//         },
//       }).populate("category");
//     } else {
//       // Mặc định lấy tất cả
//       products = await Product.find()
//         .sort({ createdAt: -1 }) // Mới nhất lên đầu
//         .populate("category"); // QUAN TRỌNG
//     }

//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500);
//     throw new Error("Lỗi khi lấy danh sách sản phẩm");
//   }
// });

const getAllProducts = asyncHandler(async (req, res) => {
  // Lấy các tham số từ URL
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;

  try {
    // 1. Khởi tạo Object chứa điều kiện lọc (Filter)
    let filter = {};

    // Nếu có category thì thêm vào điều kiện lọc
    if (qCategory) {
      filter.category = qCategory;
    }

    // Nếu có từ khóa tìm kiếm thì thêm vào điều kiện lọc
    if (qSearch) {
      filter.$text = {
        $search: qSearch,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }

    // 2. Khởi tạo Query ban đầu với điều kiện lọc
    let query = Product.find(filter).populate("category");

    // 3. Xử lý Sắp xếp (Sort)
    if (qNew) {
      // Nếu có ?new=true -> Sắp xếp mới nhất
      query = query.sort({ createdAt: -1 });
    } else {
      // Mặc định cũng sắp xếp mới nhất (hoặc bạn có thể đổi logic khác)
      query = query.sort({ createdAt: -1 });
    }

    // 4. Thực thi Query
    const products = await query;

    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sản phẩm: " + err.message });
  }
});

// 6. Rating Product
const ratingProduct = asyncHandler(async (req, res) => {
  const { star, name, comment, postedBy } = req.body;

  if (!star || star < 1 || star > 5) {
    res.status(400);
    throw new Error("Vui lòng đánh giá từ 1 đến 5 sao");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        ratings: { star, name, comment, postedBy },
      },
    },
    { new: true }
  );

  if (!updatedProduct) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }

  res.status(200).json({ message: "Đánh giá thành công" });
});

export {
  ratingProduct,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
