import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { userRequest } from "../requestMethods";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// Số lượng category hiển thị trên mỗi trang
const ROWS_PER_PAGE = 10;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Thêm Thể Loại Mới",
      html:
        '<input id="swal-input-name" class="swal2-input" placeholder="Tên thể loại">' +
        '<input id="swal-input-desc" class="swal2-input" placeholder="Mô tả (tùy chọn)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Thêm",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        return {
          name: document.getElementById("swal-input-name").value,
          description: document.getElementById("swal-input-desc").value,
        };
      },
    });

    if (formValues) {
      if (!formValues.name) {
        Swal.fire("Lỗi", "Tên thể loại không được để trống", "error");
        return;
      }
      try {
        await userRequest.post("/categories", formValues);
        Swal.fire("Thành công", "Đã thêm thể loại mới", "success");
        fetchCategories();
      } catch (err) {
        Swal.fire(
          "Lỗi",
          err.response?.data?.message || "Có lỗi xảy ra",
          "error"
        );
      }
    }
  };

  const handleEdit = async (category) => {
    const { value: formValues } = await Swal.fire({
      title: "Cập nhật Thể Loại",
      html:
        `<input id="swal-input-name" class="swal2-input" placeholder="Tên thể loại" value="${category.name}">` +
        `<input id="swal-input-desc" class="swal2-input" placeholder="Mô tả" value="${
          category.description || ""
        }">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Lưu",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        return {
          name: document.getElementById("swal-input-name").value,
          description: document.getElementById("swal-input-desc").value,
        };
      },
    });

    if (formValues) {
      if (!formValues.name) {
        Swal.fire("Lỗi", "Tên thể loại không được để trống", "error");
        return;
      }
      try {
        await userRequest.put(`/categories/${category._id}`, formValues);
        Swal.fire("Thành công", "Cập nhật thành công", "success");
        fetchCategories();
      } catch (err) {
        Swal.fire(
          "Lỗi",
          err.response?.data?.message || "Có lỗi xảy ra",
          "error"
        );
      }
    }
  };

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
          "Xóa thất bại. Có thể có ràng buộc dữ liệu.",
          "error"
        );
      }
    }
  };

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
    <div className="flex-1 p-8 bg-gray-50 h-full overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📚 Quản lý Thể Loại
        </h1>
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300"
          onClick={handleCreate}
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
                ID
              </th>
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
                Sửa
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">
                Xóa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentCategories.map((cat) => (
              <tr
                key={cat._id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                  {cat._id}
                </td>
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
                  <FaEdit
                    className="text-blue-500 cursor-pointer text-lg hover:text-blue-700 mx-auto"
                    onClick={() => handleEdit(cat)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <FaTrash
                    className="text-red-500 cursor-pointer text-lg hover:text-red-700 mx-auto"
                    onClick={() => handleDelete(cat._id)}
                  />
                </td>
              </tr>
            ))}
            {currentCategories.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
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
    </div>
  );
};

export default Categories;
