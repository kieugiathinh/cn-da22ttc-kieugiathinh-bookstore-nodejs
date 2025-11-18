import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { userRequest } from "../requestMethods";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ROWS_PER_PAGE = 10;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Tải dữ liệu sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await userRequest.get("/products");
      // Map _id thành id cho các thao tác React
      setProducts(res.data.map((p) => ({ ...p, id: p._id })));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Xử lý Xóa sản phẩm
  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Sản phẩm này sẽ bị xóa vĩnh viễn khỏi hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await userRequest.delete(`/products/${productId}`);
        Swal.fire("Đã xóa!", "Sản phẩm đã bị xóa.", "success");
        fetchProducts(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        Swal.fire("Lỗi!", "Xóa thất bại. Vui lòng thử lại.", "error");
      }
    }
  };

  // 3. Logic Phân trang
  const totalPages = Math.ceil(products.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentProducts = products.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (loading)
    return (
      <div className="p-8 text-center text-xl text-purple-600">
        Đang tải danh sách sản phẩm...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500 bg-red-100 border border-red-300 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="flex-1 p-8 bg-gray-50 h-full overflow-y-auto">
      {/* HEADER VÀ NÚT TẠO MỚI */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📚 Quản lý Sản phẩm
        </h1>
        <Link to="/newproduct">
          <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300">
            <FaPlus className="mr-2" />
            Thêm Sản Phẩm
          </button>
        </Link>
      </div>

      {/* BẢNG DỮ LIỆU SẢN PHẨM */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          {/* HEADER BẢNG */}
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Giá Bán
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">
                Sửa
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">
                Xóa
              </th>
            </tr>
          </thead>

          {/* BODY BẢNG */}
          <tbody className="divide-y divide-gray-100">
            {currentProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                {/* Cột Sản phẩm */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-12 w-12 object-cover rounded-md mr-3 ring-1 ring-gray-200"
                      src={product.img || "https://via.placeholder.com/100"}
                      alt={product.title}
                    />
                    <div className="text-sm font-semibold text-gray-900 max-w-sm truncate">
                      {product.title}
                    </div>
                  </div>
                </td>

                {/* Cột Mô tả */}
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {product.desc
                    ? product.desc.substring(0, 50) + "..."
                    : "Không có mô tả"}
                </td>

                {/* Cột Giá Bán */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                  {product.discountedPrice
                    ? product.discountedPrice.toLocaleString("vi-VN")
                    : product.originalPrice?.toLocaleString("vi-VN") ||
                      "N/A"}{" "}
                  VND
                </td>

                {/* Cột Tồn kho */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      product.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "CÒN" : "HẾT"}
                  </span>
                </td>

                {/* CỘT SỬA */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Link to={`/product/${product._id}`}>
                    <FaEdit
                      className="text-blue-500 cursor-pointer text-lg hover:text-blue-700 mx-auto"
                      title="Chỉnh sửa"
                    />
                  </Link>
                </td>

                {/* CỘT XÓA */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <FaTrash
                    className="text-red-500 cursor-pointer text-lg hover:text-red-700 mx-auto"
                    title="Xóa"
                    onClick={() => handleDelete(product._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER PHÂN TRANG */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị từ{" "}
                <span className="font-medium">
                  {Math.min(startIndex + 1, products.length)}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(startIndex + ROWS_PER_PAGE, products.length)}
                </span>{" "}
                của <span className="font-medium">{products.length}</span> sản
                phẩm
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                <span className="relative inline-flex items-center px-4 py-2 border border-purple-500 bg-purple-50 text-sm font-medium text-purple-700">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
