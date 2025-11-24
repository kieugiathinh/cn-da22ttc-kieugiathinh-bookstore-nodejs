import { useState, useEffect } from "react";
import { FaBolt, FaChevronRight } from "react-icons/fa";
import { userRequest } from "../requestMethods";
import ProductCard from "./ProductCard";

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  // Giả lập thời gian kết thúc (2 tiếng từ bây giờ)
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        // Gọi API lấy Flash Sale đang active
        const res = await userRequest.get("/flash-sales/active");
        if (res.data) {
          // Map dữ liệu cho khớp với ProductCard
          const mappedProducts = res.data.products.map((item) => ({
            ...item.product, // Lấy thông tin gốc của sách
            discountedPrice: item.discountPrice, // Ghi đè giá sale
            sold: item.soldCount, // Lấy số lượng đã bán trong đợt sale
            quantityLimit: item.quantityLimit,
          }));
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFlashSale();

    // Logic đồng hồ đếm ngược
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format giây thành HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return { h, m, s };
  };
  const time = formatTime(timeLeft);

  if (products.length === 0) return null; // Nếu không có sale thì ẩn đi

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8">
      {/* Header Flash Sale */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-orange-500 text-2xl font-extrabold italic uppercase tracking-tighter">
            <FaBolt className="mr-2 text-yellow-400 animate-pulse" /> FLASH SALE
          </div>
          {/* Countdown Timer */}
          <div className="flex items-center space-x-1 text-white font-bold">
            <span className="text-gray-500 text-sm font-normal mr-2 text-black">
              Kết thúc trong
            </span>
            <span className="bg-black px-2 py-1 rounded">{time.h}</span>
            <span className="text-black">:</span>
            <span className="bg-black px-2 py-1 rounded">{time.m}</span>
            <span className="text-black">:</span>
            <span className="bg-black px-2 py-1 rounded">{time.s}</span>
          </div>
        </div>
        <a
          href="/flash-sale"
          className="text-purple-600 font-semibold text-sm flex items-center hover:text-purple-800"
        >
          Xem tất cả <FaChevronRight className="ml-1 text-xs" />
        </a>
      </div>

      {/* Product List (Horizontal Scroll) */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.slice(0, 5).map((item) => (
          <ProductCard key={item._id} product={item} isFlashSale={true} />
        ))}
      </div>
    </div>
  );
};

export default FlashSale;
