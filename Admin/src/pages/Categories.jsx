import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaTimes, // Icon đóng modal
} from "react-icons/fa";
import { userRequest } from "../requestMethods";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ROWS_PER_PAGE = 10;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE CHO MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null); // Để biết đang Thêm hay Sửa
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // 1. Hàm Tải dữ liệu
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await userRequest.get("/categories");
      setCategories(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh mục sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Reset Form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditingCatId(null);
  };

  // 3. Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // 4. Mở Modal Sửa
  const handleOpenEditModal = (category) => {
    setEditingCatId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  };

  // 5. Xử lý nhập liệu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 6. Xử lý Lưu (Chung cho Thêm và Sửa)
  const handleSave = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!formData.name.trim()) {
      Swal.fire("Lỗi", "Tên thể loại không được để trống", "warning");
      return;
    }

    try {
      if (editingCatId) {
        // --- UPDATE ---
        await userRequest.put(`/categories/${editingCatId}`, formData);
        Swal.fire("Thành công", "Cập nhật thể loại thành công", "success");
      } else {
        // --- CREATE ---
        await userRequest.post("/categories", formData);
        Swal.fire("Thành công", "Đã thêm thể loại mới", "success");
      }

      setShowModal(false);
      resetForm();
      fetchCategories(); // Load lại dữ liệu
    } catch (err) {
      Swal.fire("Lỗi", err.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  // 7. Xử lý Xóa
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await userRequest.delete(`/categories/${id}`);
        Swal.fire("Đã xóa!", "Thể loại đã bị xóa.", "success");
        fetchCategories();
      } catch (error) {
        Swal.fire(
          "Lỗi!",
          "Xóa thất bại. Có thể có sách đang thuộc thể loại này.",
          "error"
        );
      }
    }
  };

  // Logic Phân trang
  const totalPages = Math.ceil(categories.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentCategories = categories.slice(
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
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500 bg-red-100 border border-red-300 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="flex-1 p-8 bg-gray-50 h-full overflow-y-auto relative">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📚 Quản lý Thể Loại
        </h1>
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300"
          onClick={handleOpenAddModal} // Mở modal thêm
        >
          <FaPlus className="mr-2" />
          Thêm Thể Loại
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Tên Thể Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentCategories.map((cat) => (
              <tr
                key={cat._id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                  {cat.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">
                  {cat.description || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(cat.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-4">
                    <FaEdit
                      className="text-blue-500 cursor-pointer text-lg hover:text-blue-700"
                      onClick={() => handleOpenEditModal(cat)} // Mở modal sửa
                    />
                    <FaTrash
                      className="text-red-500 cursor-pointer text-lg hover:text-red-700"
                      onClick={() => handleDelete(cat._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {currentCategories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Chưa có thể loại nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FaChevronLeft className="mr-2" /> Trước
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sau <FaChevronRight className="ml-2" />
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị trang{" "}
                <span className="font-medium">{currentPage}</span> /{" "}
                <span className="font-medium">{totalPages || 1}</span>
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

      {/* ==================== MODAL (DIALOG) ==================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-20 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                {editingCatId ? "Cập Nhật Thể Loại" : "Thêm Thể Loại Mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Tên thể loại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Thể Loại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Ví dụ: Tiểu thuyết"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Mô tả ngắn về thể loại..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-lg"
                >
                  {editingCatId ? "Cập Nhật" : "Thêm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
