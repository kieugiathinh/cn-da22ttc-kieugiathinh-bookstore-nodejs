import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaTicketAlt, FaClock } from "react-icons/fa";

const MyVouchers = () => {
  const user = useSelector((state) => state.user.currentUser);

  // Lấy danh sách từ Redux
  // Lưu ý: Tùy vào Backend populate hay chưa mà item.coupon là Object hay ID String
  // Code dưới đây giả định Backend khi login/update đã populate thông tin coupon
  const wallet = user?.wallet || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaTicketAlt className="mr-3 text-purple-600" /> KHO GIẢM GIÁ CỦA TÔI
        </h1>

        {wallet.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-500 mb-4">Bạn chưa lưu mã giảm giá nào.</p>
            <Link to="/" className="text-purple-600 font-bold hover:underline">
              Săn mã ngay tại Trang chủ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallet.map((item, index) => {
              // Xử lý an toàn nếu coupon bị null (do admin xóa)
              const coupon = item.coupon;
              if (!coupon) return null;

              return (
                <div
                  key={index}
                  className={`relative bg-white border rounded-lg p-4 shadow-sm flex justify-between items-center overflow-hidden
                    ${
                      item.isUsed ? "opacity-60 grayscale" : "border-purple-200"
                    }
                  `}
                >
                  {/* Trang trí vé */}
                  <div className="absolute -left-2 top-1/2 -mt-2 w-4 h-4 rounded-full bg-gray-50 border-r border-gray-200"></div>
                  <div className="absolute -right-2 top-1/2 -mt-2 w-4 h-4 rounded-full bg-gray-50 border-l border-gray-200"></div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {coupon.code || "MÃ KHÔNG TỒN TẠI"}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {coupon.description}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <FaClock className="mr-1" />
                      HSD:{" "}
                      {coupon.endDate
                        ? new Date(coupon.endDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>

                  <div className="text-right">
                    {item.isUsed ? (
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                        Đã dùng
                      </span>
                    ) : (
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                        Sẵn sàng
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVouchers;
