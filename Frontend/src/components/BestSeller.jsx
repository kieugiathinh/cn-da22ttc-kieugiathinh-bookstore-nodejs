// import { useEffect, useState } from "react";
// import { FaChartLine } from "react-icons/fa";
// import { userRequest } from "../requestMethods"; // Import axios request
// import ProductCard from "./ProductCard";

// const BestSeller = () => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchBestSellers = async () => {
//       try {
//         // Gọi API lấy tất cả sản phẩm
//         const res = await userRequest.get("/products");

//         // Logic lọc Top bán chạy: Sắp xếp theo 'sold' (hoặc countInStock ngược lại nếu chưa có field sold)
//         // Giả sử bạn chưa có field 'sold' trong Product Model, ta dùng tạm logic nào đó
//         // hoặc bạn cần thêm field 'sold' vào Product Model.
//         // Ở đây mình giả định sort theo createdAt tạm thời, bạn hãy đổi logic sort thành `b.sold - a.sold`
//         const sortedData = res.data
//           .sort((a, b) => b.discountedPrice - a.discountedPrice)
//           .slice(0, 10);

//         setProducts(sortedData);
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchBestSellers();
//   }, []);

//   return (
//     <div className="bg-white rounded-xl shadow-sm mb-8">
//       <div className="px-5 py-4 border-b border-gray-100">
//         <h2 className="text-xl font-bold text-gray-800 flex items-center uppercase">
//           <FaChartLine className="mr-2 text-red-500" /> Top Sách Bán Chạy
//         </h2>
//       </div>

//       {/* Grid Layout giống Figma */}
//       <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {products.map((item) => (
//           // Giả lập số đã bán (sold) để hiển thị thanh progress bar cho đẹp
//           <ProductCard
//             key={item._id}
//             product={{
//               ...item,
//               sold: Math.floor(Math.random() * 500) + 50,
//               quantityLimit: 1000,
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BestSeller;

import { useEffect, useState } from "react";
import { FaChartLine, FaTrophy } from "react-icons/fa";
import { userRequest } from "../requestMethods";
import ProductCard from "./ProductCard";

const BestSeller = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await userRequest.get("/products");

        // 1. Xử lý dữ liệu: Giả lập số lượng bán (Nếu DB sau này có field 'sold' thì bỏ dòng Math.random đi)
        const productsWithSold = res.data.map((item) => ({
          ...item,
          // Giả sử số lượng bán từ 50 đến 1000 cuốn
          // Lưu ý: Nếu item đã có field 'sold' thật từ DB thì ưu tiên dùng nó
          sold: item.sold || Math.floor(Math.random() * 950) + 50,
          quantityLimit: 1000, // Giả định thanh tiến độ max là 1000
        }));

        // 2. Sắp xếp: Bán chạy nhất lên đầu (Giảm dần theo 'sold')
        const sortedData = productsWithSold.sort((a, b) => b.sold - a.sold);

        // 3. Lấy đúng 10 cuốn đứng đầu
        setProducts(sortedData.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 border border-indigo-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
        <h2 className="text-xl font-extrabold text-gray-800 flex items-center uppercase tracking-wide">
          <FaTrophy className="mr-3 text-yellow-500 text-2xl" />
          Bảng Xếp Hạng Bán Chạy
        </h2>
        <span className="text-sm font-medium text-indigo-600 cursor-pointer hover:underline">
          Xem tất cả &gt;
        </span>
      </div>

      {/* Grid Layout: 5 cột x 2 hàng = 10 sản phẩm */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((item, index) => (
          <div key={item._id} className="relative">
            {/* Badge Top 1, 2, 3 (Trang trí thêm cho xịn) */}
            {index < 3 && (
              <div
                className={`absolute top-0 left-0 z-10 w-8 h-8 flex items-center justify-center font-bold text-white text-sm rounded-tl-lg rounded-br-lg shadow-md
                    ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : "bg-orange-700"
                    }
                 `}
              >
                #{index + 1}
              </div>
            )}

            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
