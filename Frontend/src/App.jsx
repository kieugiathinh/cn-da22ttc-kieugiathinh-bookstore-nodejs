import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate, // Import thêm Navigate để chuyển hướng
} from "react-router-dom";

// Import các trang
import Home from "./pages/Home"; // <--- BỔ SUNG IMPORT NÀY
import Login from "./pages/Login";
import Register from "./pages/Register";

import { useSelector } from "react-redux";

function App() {
  // Lấy thông tin user từ Redux để kiểm tra đăng nhập
  const user = useSelector((state) => state.user);
  const currentUser = user.currentUser; // Biến này chứa info user hoặc null

  const Layout = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {/* Thêm min-h để đẩy Footer xuống đáy nếu nội dung ngắn */}
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/login",
          // LOGIC: Nếu có user rồi thì đá về Home, chưa có thì mới hiện Login
          element: currentUser ? <Navigate to="/" /> : <Login />,
        },
        {
          // Đổi thành /register cho chuẩn với Navbar và Login component
          path: "/register",
          // LOGIC: Nếu có user rồi thì đá về Home
          element: currentUser ? <Navigate to="/" /> : <Register />,
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
