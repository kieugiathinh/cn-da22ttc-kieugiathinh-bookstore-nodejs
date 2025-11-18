import {
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { userRequest } from "../requestMethods";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// Số lượng user hiển thị trên mỗi trang
const ROWS_PER_PAGE = 10;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // State quản lý trang hiện tại

  // 1. Hàm Tải dữ liệu
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userRequest.get("/users");
      // Vẫn cần map _id thành id cho các thao tác logic sau này
      setUsers(res.data.map((user) => ({ ...user, id: user._id })));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Xử lý Xóa
  const handleDelete = async (userId) => {
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
        await userRequest.delete(`/users/${userId}`);
        Swal.fire("Đã xóa!", "Người dùng đã bị xóa khỏi hệ thống.", "success");
        fetchUsers(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        Swal.fire("Lỗi!", "Xóa thất bại. Vui lòng thử lại.", "error");
      }
    }
  };

  // 3. Logic Phân trang
  const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Hiển thị trạng thái
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
      {/* HEADER VÀ NÚT TẠO MỚI */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          👤 Quản lý Người dùng
        </h1>
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition duration-300"
          onClick={() => alert("Chức năng tạo mới")}
        >
          <FaUserPlus className="mr-2" />
          Tạo Người Dùng
        </button>
      </div>

      {/* BẢNG DỮ LIỆU CHUYỂN ĐỔI THÀNH REACT/TAILWIND TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          {/* HEADER BẢNG */}
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                ID Hệ thống
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Tên đăng nhập
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Vai trò
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
            {currentUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                  {user._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.username || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.phone || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      user.isAdmin
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "Khách hàng"}
                  </span>
                </td>

                {/* CỘT SỬA */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <FaEdit
                    className="text-blue-500 cursor-pointer text-lg hover:text-blue-700 mx-auto"
                    title="Chỉnh sửa"
                    onClick={() => alert(`Sửa ID: ${user._id}`)}
                  />
                </td>

                {/* CỘT XÓA */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <FaTrash
                    className="text-red-500 cursor-pointer text-lg hover:text-red-700 mx-auto"
                    title="Xóa"
                    onClick={() => handleDelete(user._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER PHÂN TRANG */}
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
                Hiển thị từ{" "}
                <span className="font-medium">
                  {Math.min(startIndex + 1, users.length)}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(startIndex + ROWS_PER_PAGE, users.length)}
                </span>{" "}
                của <span className="font-medium">{users.length}</span> kết quả
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

export default Users;
