import { Link } from "react-router-dom";
import { FaFire } from "react-icons/fa";

const ProductCard = ({ product, isFlashSale = false }) => {
  // Tính phần trăm giảm giá
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.discountedPrice) /
          product.originalPrice) *
          100
      )
    : 0;

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer relative group h-full flex flex-col">
      {/* Badge giảm giá */}
      {discountPercent > 0 && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 font-bold text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg z-10">
          -{discountPercent}%
        </div>
      )}

      <Link to={`/product/${product._id}`} className="flex-1 flex flex-col">
        {/* Ảnh sản phẩm */}
        <div className="h-48 w-full flex items-center justify-center overflow-hidden mb-3">
          <img
            src={product.img}
            alt={product.title}
            className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Tên sách */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px]">
          {product.title}
        </h3>

        {/* Giá tiền */}
        <div className="mt-auto">
          <div className="flex items-end space-x-2">
            <span className="text-red-600 font-bold text-lg">
              {product.discountedPrice?.toLocaleString("vi-VN")}đ
            </span>
            {product.originalPrice > 0 && (
              <span className="text-gray-400 text-xs line-through mb-1">
                {product.originalPrice?.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* Thanh trạng thái bán (Dành cho Flash Sale hoặc Best Seller) */}
          <div className="mt-3 relative">
            <div className="w-full bg-red-100 rounded-full h-4 relative overflow-hidden">
              {/* Thanh tiến độ */}
              <div
                className="bg-red-500 h-full absolute top-0 left-0 z-0"
                style={{
                  width: `${Math.min(
                    (product.sold / (product.quantityLimit || 100)) * 100,
                    100
                  )}%`,
                }}
              ></div>
              {/* Text đè lên */}
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white z-10 uppercase tracking-wide">
                <FaFire className="mr-1" /> Đã bán {product.sold || 0}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
