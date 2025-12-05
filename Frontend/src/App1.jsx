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
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import MyAccount from "./pages/MyAccount";
import Order from "./pages/Order";
import Success from "./pages/Success";
import Checkout from "./pages/Checkout";
import ProductList from "./pages/ProductList";

import { useSelector } from "react-redux";

function App() {
  const user = useSelector((state) => state.user);
  const currentUser = user.currentUser;

  const Layout = () => {
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
          element: currentUser ? <Navigate to="/" /> : <Login />,
        },
        {
          path: "/register",
          element: currentUser ? <Navigate to="/" /> : <Register />,
        },
        {
          path: "/cart",
          element: <Cart />,
        },
        {
          path: "/product/:productId",
          element: <ProductDetail />,
        },
        {
          path: "/myaccount",
          element: user?.currentUser ? <MyAccount /> : <Home />,
        },
        {
          path: "/myorders",
          element: user?.currentUser ? <Order /> : <Login />,
        },
        {
          path: "/success",
          element: <Success />,
        },
        {
          path: "/checkout",
          element: <Checkout />,
        },
        {
          path: "/products/:category",
          element: <ProductList />,
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
