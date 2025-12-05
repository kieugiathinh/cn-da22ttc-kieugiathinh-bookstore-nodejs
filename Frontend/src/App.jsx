import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

// ==================== 1. IMPORT CHO KHÁCH HÀNG (CLIENT) ====================
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail"; // File chi tiết sản phẩm của khách
import MyAccount from "./pages/MyAccount";
import Order from "./pages/Order"; // Lịch sử đơn hàng của khách
import Success from "./pages/Success";
import Checkout from "./pages/Checkout";
import ProductList from "./pages/ProductList";

// ==================== 2. IMPORT CHO QUẢN TRỊ (ADMIN) ====================
// Lưu ý: Bạn cần sửa đường dẫn import cho đúng với nơi bạn đặt file Admin
import AdminMenu from "./components/admin/Menu";
import AdminHome from "./pages/admin/Home";
import AdminUsers from "./pages/admin/Users";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders"; // Quản lý đơn hàng của Admin
import AdminBanners from "./pages/admin/Banners";
import AdminFlashSales from "./pages/admin/FlashSales";
import AdminProductEdit from "./pages/admin/Product"; // Trang sửa sản phẩm của Admin
import AdminNewProduct from "./pages/admin/NewProduct"; // Trang thêm sản phẩm của Admin
import AdminCategories from "./pages/admin/Categories";

function App() {
  const user = useSelector((state) => state.user);
  const currentUser = user.currentUser;

  // --- LAYOUT CHO KHÁCH HÀNG (Navbar + Footer) ---
  const ClientLayout = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    );
  };

  // --- LAYOUT CHO ADMIN (Sidebar bên trái) ---
  const AdminLayout = () => {
    // Bảo vệ: Chỉ Admin (role === 1) mới được vào
    if (!currentUser || currentUser.role !== 1) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar cố định bên trái */}
        <div className="w-64 flex-none border-r bg-white shadow-sm h-screen sticky top-0 overflow-y-auto z-50">
          <AdminMenu />
        </div>

        {/* Nội dung chính bên phải */}
        <div className="flex-1 p-4 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    );
  };

  const router = createBrowserRouter([
    // ==================== ROUTE KHÁCH HÀNG ====================
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { path: "/", element: <Home /> },
        {
          path: "/login",
          element: currentUser ? <Navigate to="/" /> : <Login />,
        },
        {
          path: "/register",
          element: currentUser ? <Navigate to="/" /> : <Register />,
        },
        { path: "/cart", element: <Cart /> },

        // Route sản phẩm
        { path: "/product/:id", element: <ProductDetail /> },
        { path: "/products", element: <ProductList /> },
        { path: "/products/:category", element: <ProductList /> },

        // Route cá nhân
        {
          path: "/myaccount",
          element: currentUser ? <MyAccount /> : <Login />,
        },
        { path: "/myorders", element: currentUser ? <Order /> : <Login /> },

        // Route thanh toán
        { path: "/checkout", element: <Checkout /> },
        { path: "/success", element: <Success /> },
      ],
    },

    // ==================== ROUTE ADMIN (/admin) ====================
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "", element: <AdminHome /> }, // Dashboard
        { path: "users", element: <AdminUsers /> }, // Quản lý User
        { path: "products", element: <AdminProducts /> }, // Quản lý Sản phẩm
        { path: "product/:id", element: <AdminProductEdit /> }, // Sửa sản phẩm
        { path: "newproduct", element: <AdminNewProduct /> }, // Thêm sản phẩm
        { path: "orders", element: <AdminOrders /> }, // Quản lý Đơn hàng
        { path: "categories", element: <AdminCategories /> },
        { path: "banners", element: <AdminBanners /> },
        { path: "flash-sales", element: <AdminFlashSales /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
