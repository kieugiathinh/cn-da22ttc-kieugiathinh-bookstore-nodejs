import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userRequest } from "../requestMethods.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!name || !email || !password || !username) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      // Gửi dữ liệu lên server
      // Lưu ý: Backend của bạn cần nhận: fullname (name), username, email, password
      await userRequest.post("/auth/register", {
        fullname: name, // Map 'name' state sang 'fullname' của DB
        username: username,
        email: email,
        password: password,
      });

      toast.success("Đăng ký thành công! Đang chuyển hướng...");

      // Chờ 2s để user đọc thông báo rồi mới chuyển trang
      setTimeout(() => {
        setLoading(false);
        navigate("/login");
      }, 2000);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer theme="colored" autoClose={2000} />

      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* --- CỘT TRÁI: HÌNH ẢNH --- */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="/tieuthuyet1.jpg" // Dùng chung ảnh với login hoặc đổi ảnh khác
            alt="Register Background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/50 to-pink-600/50 mix-blend-multiply"></div>
          <div className="absolute bottom-10 left-10 text-white z-10 pr-10">
            <h3 className="text-3xl font-bold mb-2">Tham gia cùng chúng tôi</h3>
            <p className="text-sm opacity-90">
              Tạo tài khoản để khám phá kho tàng tri thức và nhận những ưu đãi
              đặc biệt.
            </p>
          </div>
        </div>

        {/* --- CỘT PHẢI: FORM ĐĂNG KÝ --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Tạo Tài Khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nhập thông tin của bạn để bắt đầu
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Nguyễn Văn A"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Username (Thêm trường này vì DB bạn yêu cầu username unique) */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="nguyenvana123"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="email@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaUserPlus className="mr-2" /> Đăng Ký Ngay
                </span>
              )}
            </button>

            {/* Footer Link */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Bạn đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-bold text-purple-600 hover:text-purple-500 transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
