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

  // --- THÊM 2 BIẾN MỚI ---
  const qTopRated = req.query.toprated;
  const qRandom = req.query.random;

  try {
    let products;

    // --- TRƯỜNG HỢP 1: LẤY NGẪU NHIÊN (RANDOM) ---
    if (qRandom) {
      // Dùng Aggregation $sample của MongoDB
      products = await Product.aggregate([
        { $sample: { size: 10 } }, // Lấy ngẫu nhiên 10 sản phẩm
      ]);
      // Vì aggregate trả về object thuần, cần populate thủ công để lấy tên thể loại
      products = await Product.populate(products, { path: "category" });
    }

    // --- TRƯỜNG HỢP 2: LẤY ĐÁNH GIÁ CAO (TOP RATED) ---
    else if (qTopRated) {
      products = await Product.find({
        rating: { $gte: 4.0 }, // Điểm >= 4.0 (Để 4.0 cho dễ ra kết quả test, sau này sửa lên 4.5)
        numReviews: { $gt: 0 }, // Có ít nhất 1 đánh giá (Sửa thành > 5 hoặc 10 khi site đã đông)
      })
        .sort({ rating: -1, numReviews: -1 }) // Ưu tiên điểm cao, sau đó đến số lượng nhiều
        .limit(10)
        .populate("category");
    }

    // --- TRƯỜNG HỢP 3: LỌC VÀ TÌM KIẾM THƯỜNG (Logic cũ) ---
    else {
      let filter = {};

      if (qCategory) {
        filter.category = qCategory;
      }
      if (qSearch) {
        filter.title = {
          $regex: qSearch,
          $options: "i",
        };
      }

      let query = Product.find(filter).populate("category");

      if (qNew) {
        query = query.sort({ createdAt: -1 });
      } else if (qBestSeller) {
        query = query.sort({ sold: -1 });
      } else {
        query = query.sort({ createdAt: -1 });
      }

      products = await query;
    }

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
