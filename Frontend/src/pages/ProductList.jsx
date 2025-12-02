import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { userRequest } from "../requestMethods";
import ProductCard from "../components/ProductCard";
import { FaFilter, FaSortAmountDown } from "react-icons/fa";

const ProductList = () => {
  const location = useLocation();
  // Lấy categoryId từ URL (ví dụ: /products/65a123... -> id = 65a123...)
  const catId = location.pathname.split("/")[2];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest"); // State sắp xếp
  const [categoryName, setCategoryName] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    const getProducts = async () => {
      try {
        // Gọi API lọc theo category
        const res = await userRequest.get(`/products?category=${catId}`);
        setProducts(res.data);

        // Lấy tên thể loại từ sản phẩm đầu tiên (nếu có) để hiển thị tiêu đề
        if (res.data.length > 0 && res.data[0].category) {
          setCategoryName(res.data[0].category.name);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    getProducts();
  }, [catId]);

  // 2. Logic Sắp xếp (Frontend Sort)
  useEffect(() => {
    if (sort === "newest") {
      setProducts((prev) =>
        [...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } else if (sort === "asc") {
      setProducts((prev) =>
        [...prev].sort((a, b) => a.discountedPrice - b.discountedPrice)
      );
    } else {
      setProducts((prev) =>
        [...prev].sort((a, b) => b.discountedPrice - a.discountedPrice)
      );
    }
  }, [sort]);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header: Tên thể loại & Bộ lọc */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">
            {categoryName || "Danh sách sản phẩm"}
            <span className="text-gray-500 text-base font-normal ml-2 lowercase">
              ({products.length} kết quả)
            </span>
          </h1>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center text-gray-600">
              <FaFilter className="mr-2" />{" "}
              <span className="font-semibold">Sắp xếp:</span>
            </div>
            <select
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 outline-none focus:border-purple-500 text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="asc">Giá: Thấp đến Cao</option>
              <option value="desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
              alt="Empty"
              className="w-32 mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-500 text-lg">
              Chưa có sách nào trong thể loại này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
