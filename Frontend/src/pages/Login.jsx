import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/apiCalls.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { FaUser, FaLock, FaArrowRight } from "react-icons/fa"; // Đổi icon FaEnvelope -> FaUser

const Login = () => {
  // 1. Đổi state email -> username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isFetching } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate
    if (!username || !password) {
      toast.warning("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!");
      return;
    }

    try {
      // 2. Gửi username thay vì email
      await login(dispatch, { username, password });
      navigate("/");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-4xl w-full space-y-8 bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* CỘT TRÁI: HÌNH ẢNH (Giữ nguyên) */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="/tieuthuyet1.jpg"
            alt="Login Background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/40 to-pink-600/40 mix-blend-multiply"></div>
          <div className="absolute bottom-10 left-10 text-white z-10">
            <h3 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h3>
            <p className="text-sm opacity-90">
              Tiếp tục hành trình khám phá tri thức cùng GTBooks.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Đăng Nhập</h2>
            <p className="mt-2 text-sm text-gray-600">
              Truy cập vào tài khoản của bạn
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Username (Đã sửa) */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Icon hình người */}
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="username123" // Placeholder mới
                  onChange={(e) => setUsername(e.target.value)} // Set state username
                />
              </div>
            </div>

            {/* Input Password (Giữ nguyên) */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-purple-600 hover:text-purple-500"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Button Login */}
            <button
              type="submit"
              disabled={isFetching}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isFetching ? (
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
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center">
                  Đăng Nhập{" "}
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

            {/* Footer Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="font-bold text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
