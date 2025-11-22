import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import Menu from "./components/Menu.jsx";
import Home from "./pages/Home.jsx";
import Users from "./pages/Users.jsx";
import Products from "./pages/Products.jsx";
import Orders from "./pages/Orders.jsx";
import Banners from "./pages/Banners.jsx";
import Product from "./pages/Product.jsx";
import NewProduct from "./pages/NewProduct.jsx";
import Categories from "./pages/Categories.jsx";
import FlashSales from "./pages/FlashSales.jsx";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 flex-none border-r">
        <Menu />
      </div>

      <div className="w-full flex-1 bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
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
          path: "/users",
          element: <Users />,
        },
        {
          path: "/categories",
          element: <Categories />,
        },
        {
          path: "/products",
          element: <Products />,
        },
        {
          path: "/orders",
          element: <Orders />,
        },
        {
          path: "/banners",
          element: <Banners />,
        },
        {
          path: "/product/:id",
          element: <Product />,
        },
        {
          path: "/newproduct",
          element: <NewProduct />,
        },
        {
          path: "/flash-sales",
          element: <FlashSales />,
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
