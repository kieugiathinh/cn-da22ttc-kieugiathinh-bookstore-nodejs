import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import Menu from "./components/Menu.jsx";
import Home from "./pages/Home.jsx";
import Users from "./pages/Users.jsx";
import Products from "./pages/Products.jsx";
import Orders from "./pages/Orders.jsx";
import Banners from "./pages/Banners.jsx";
import Product from "./pages/Product.jsx";
import NewProduct from "./pages/NewProduct.jsx";

function App() {
  const Layout = () => {
    return (
      <div className="flex">
        <div>
          <Menu />
        </div>

        <div>
          <Outlet />
        </div>
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
          path: "/users",
          element: <Users />,
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
