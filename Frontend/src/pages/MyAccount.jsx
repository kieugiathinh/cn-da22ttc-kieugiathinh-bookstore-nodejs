import { useDispatch, useSelector } from "react-redux";
import { logOut, loginSuccess } from "../redux/userRedux"; // Import loginSuccess để cập nhật Redux sau khi save
import { userRequest } from "../requestMethods";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaSignOutAlt,
  FaSave,
  FaIdBadge,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const MyAccount = () => {
  const user = useSelector((state) => state.user);
  const currentUser = user.currentUser;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State lưu thông tin form
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    // Password states
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load dữ liệu user vào form khi trang được tải
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullname: currentUser.fullname || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      }));
    }
  }, [currentUser]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý Đăng xuất
  const handleLogout = () => {
    dispatch(logOut());
    navigate("/login");
  };

  // Xử lý Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userRequest.put(`/users/${currentUser._id}`, {
        fullname: formData.fullname,
        phone: formData.phone,
        address: formData.address,
      });

      // Cập nhật lại Redux Store với thông tin mới
      // Lưu ý: Cần merge thông tin cũ (token, role...) với thông tin mới
      dispatch(loginSuccess({ ...currentUser, ...res.data }));

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // Xử lý Đổi mật khẩu (Tùy chọn logic backend)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    // Gọi API đổi pass ở đây (cần backend hỗ trợ endpoint change-password)
    toast.info("Chức năng đổi mật khẩu đang phát triển");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
            Tài Khoản Của Tôi
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Account Info Banner */}
          <div className="p-8 border-b border-rose-100 bg-rose-50/50">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white border-2 border-rose-200 rounded-full flex items-center justify-center mr-6 shadow-sm text-3xl text-rose-500 font-bold">
                {currentUser?.fullname
                  ? currentUser.fullname.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentUser?.fullname}
                </h2>
                <p className="text-gray-500 font-medium">
                  @{currentUser?.username}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase">
                  {currentUser?.role === 1 ? "Admin" : "Thành viên"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12">
            {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center pb-2 border-b border-gray-100">
                <FaUser className="text-rose-500 mr-3" />
                Thông Tin Cá Nhân
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Username (READ ONLY) */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Tên đăng nhập (Không thể sửa)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdBadge className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={currentUser?.username}
                      disabled
                      className="w-full pl-10 p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email (READ ONLY) */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Email (Không thể sửa)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={currentUser?.email}
                      disabled
                      className="w-full pl-10 p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Full Name (EDITABLE) */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Họ và Tên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Phone (EDITABLE) */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Thêm số điện thoại..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Address (EDITABLE) */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Địa chỉ giao hàng
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Thêm địa chỉ..."
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3 rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <FaSave className="mr-2" />
                  LƯU THAY ĐỔI
                </button>
              </form>
            </div>

            {/* --- CỘT PHẢI: BẢO MẬT --- */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center pb-2 border-b border-gray-100">
                <FaLock className="text-rose-500 mr-3" />
                Bảo Mật
              </h3>

              <form
                onSubmit={handleChangePassword}
                className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-100"
              >
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-white border border-rose-500 text-rose-600 hover:bg-rose-50 py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
                >
                  ĐỔI MẬT KHẨU
                </button>
              </form>

              <div className="mt-8 border-t pt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center shadow-lg"
                >
                  <FaSignOutAlt className="mr-2" />
                  ĐĂNG XUẤT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
