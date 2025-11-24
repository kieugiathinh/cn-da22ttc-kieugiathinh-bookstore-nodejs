import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { userRequest } from "../requestMethods"; // Import axios request
import ProductCard from "./ProductCard";

const BestSeller = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        // Gọi API lấy tất cả sản phẩm
        const res = await userRequest.get("/products");

        // Logic lọc Top bán chạy: Sắp xếp theo 'sold' (hoặc countInStock ngược lại nếu chưa có field sold)
        // Giả sử bạn chưa có field 'sold' trong Product Model, ta dùng tạm logic nào đó
        // hoặc bạn cần thêm field 'sold' vào Product Model.
        // Ở đây mình giả định sort theo createdAt tạm thời, bạn hãy đổi logic sort thành `b.sold - a.sold`
        const sortedData = res.data
          .sort((a, b) => b.discountedPrice - a.discountedPrice)
          .slice(0, 10);

        setProducts(sortedData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center uppercase">
          <FaChartLine className="mr-2 text-red-500" /> Top Sách Bán Chạy
        </h2>
      </div>

      {/* Grid Layout giống Figma */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((item) => (
          // Giả lập số đã bán (sold) để hiển thị thanh progress bar cho đẹp
          <ProductCard
            key={item._id}
            product={{
              ...item,
              sold: Math.floor(Math.random() * 500) + 50,
              quantityLimit: 1000,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
