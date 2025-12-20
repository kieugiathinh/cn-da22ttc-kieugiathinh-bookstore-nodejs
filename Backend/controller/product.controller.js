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

const getAllProducts = asyncHandler(async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;
  const qBestSeller = req.query.bestseller;

  try {
    let filter = {};

    if (qCategory) {
      filter.category = qCategory;
    }
    if (qSearch) {
      filter.$text = {
        $search: qSearch,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }

    let query = Product.find(filter).populate("category");

    // --- XỬ LÝ SẮP XẾP ---
    if (qNew) {
      query = query.sort({ createdAt: -1 });
    } else if (qBestSeller) {
      // NẾU CÓ QUERY BESTSELLER -> SẮP XẾP THEO SOLD GIẢM DẦN
      query = query.sort({ sold: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách sản phẩm: " + err.message });
  }
});

export {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
