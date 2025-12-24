import { useEffect, useState } from "react";
import { userRequest } from "../requestMethods";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { updateWallet } from "../redux/userRedux";
import Slider from "react-slick";
import {
  FaTicketAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaGift,
} from "react-icons/fa";

// Import CSS cho slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- CUSTOM ARROW BUTTONS (Giữ nguyên) ---
const NextArrow = ({ onClick }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 -right-2 md:-right-4 transform -translate-y-1/2 z-10 cursor-pointer bg-white text-purple-600 hover:bg-purple-700 hover:text-white shadow-md rounded-full p-2 border border-purple-50 transition-all duration-300 group"
  >
    <FaChevronRight className="group-hover:scale-110 transition-transform" />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 -left-2 md:-left-4 transform -translate-y-1/2 z-10 cursor-pointer bg-white text-purple-600 hover:bg-purple-700 hover:text-white shadow-md rounded-full p-2 border border-purple-50 transition-all duration-300 group"
  >
    <FaChevronLeft className="group-hover:scale-110 transition-transform" />
  </div>
);

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const getCoupons = async () => {
      try {
        // Thêm params để đảm bảo chỉ lấy mã còn hạn và đang kích hoạt từ server
        const res = await userRequest.get("/coupons?isActive=true");
        // Lọc thêm ở client để chắc chắn (nếu backend chưa lọc chuẩn ngày)
        const validCoupons = res.data.filter(
          (c) => new Date(c.endDate) > new Date()
        );
        setCoupons(validCoupons);
      } catch (err) {
        console.error(err);
      }
    };
    getCoupons();
  }, []);

  const handleSaveCoupon = async (couponId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu mã!");
      return;
    }
    try {
      const res = await userRequest.post("/coupons/save", { couponId });
      toast.success("Đã lưu vào kho voucher!");
      dispatch(updateWallet(res.data.wallet));
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu mã");
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  if (coupons.length === 0) return null;

  return (
    // --- CONTAINER CHÍNH ĐƯỢC CẢI TIẾN ---
    // 1. bg-gradient-to-br...: Tạo nền chuyển màu nhẹ từ tím nhạt sang hồng nhạt.
    // 2. rounded-3xl: Bo góc tròn mềm mại.
    // 3. shadow-sm & border: Tạo độ nổi nhẹ nhàng.
    // 4. relative & overflow-hidden: Để chứa các hiệu ứng trang trí nền.
    <div className="my-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-purple-50/50 to-pink-50 p-6 md:p-8 border border-purple-100/50 shadow-sm">
      {/* --- HIỆU ỨNG TRANG TRÍ NỀN (Mờ ảo, không gây chú ý mạnh) --- */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-purple-200 opacity-30 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
      <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 bg-pink-200 opacity-30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

      {/* Nội dung chính đặt trong relative z-10 để nổi lên trên nền trang trí */}
      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-center mb-6 gap-3">
          <div className="bg-white p-3 rounded-full shadow-sm text-purple-600 ring-2 ring-purple-50">
            <FaGift className="text-2xl animate-pulse" />{" "}
            {/* Đổi icon hộp quà cho sinh động */}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-wide">
              Ưu Đãi Dành Cho Bạn
            </h2>
            <p className="text-sm text-gray-500">
              Lưu ngay các mã giảm giá hấp dẫn bên dưới
            </p>
          </div>
        </div>

        {/* SLIDER WRAPPER */}
        <div className="px-2 py-2">
          <Slider {...settings}>
            {coupons.map((coupon) => {
              const isSaved = user?.wallet?.some(
                (item) =>
                  item.coupon === coupon._id || item.coupon?._id === coupon._id
              );

              // Tính toán % hoặc số tiền để hiển thị nổi bật
              const discountHighlight =
                coupon.discountType === "PERCENT"
                  ? `${coupon.discountValue}%`
                  : `${coupon.discountValue / 1000}K`;

              return (
                <div key={coupon._id} className="px-3 py-2 h-full">
                  {/* CARD VOUCHER BÊN TRONG - Giữ nền trắng để nổi bật trên nền container */}
                  <div className="bg-white border-2 border-purple-50 rounded-2xl p-4 flex flex-col justify-between items-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden h-full min-h-[140px] group">
                    {/* Trang trí: Hình bán nguyệt + đường kẻ */}
                    <div className="absolute -left-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-purple-50 border-r border-purple-100"></div>
                    <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 rounded-full bg-purple-50 border-l border-purple-100"></div>
                    <div className="absolute left-[70%] top-3 bottom-3 border-l-2 border-dashed border-purple-100 hidden md:block opacity-50"></div>

                    <div className="flex w-full h-full">
                      {/* Phần trái: Thông tin chính */}
                      <div className="flex-1 pr-4 flex flex-col justify-center">
                        {/* Hiển thị mức giảm giá to, rõ ràng */}
                        <div className="text-3xl font-extrabold text-purple-700 leading-tight">
                          <span className="text-lg font-medium text-purple-500">
                            Giảm
                          </span>{" "}
                          {discountHighlight}
                        </div>

                        <div className="flex items-center gap-2 mt-1 mb-2">
                          <span className="bg-purple-100 text-purple-800 font-bold text-sm px-2 py-0.5 rounded-md border border-purple-200">
                            {coupon.code}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 font-medium">
                          {coupon.description}
                        </p>
                      </div>

                      {/* Phần phải: Nút bấm & HSD */}
                      <div className="md:pl-4 flex flex-col items-center justify-between md:border-l md:border-dashed md:border-purple-100 min-w-[90px]">
                        <div className="text-[10px] text-gray-400 text-center mb-2 bg-gray-50 px-2 py-1 rounded-full w-full">
                          HSD:{" "}
                          {new Date(coupon.endDate).toLocaleDateString(
                            "vi-VN",
                            { day: "2-digit", month: "2-digit" }
                          )}
                        </div>

                        <button
                          onClick={() => handleSaveCoupon(coupon._id)}
                          disabled={isSaved}
                          className={`
                                flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-all w-full shadow-sm
                                ${
                                  isSaved
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                    : "bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:from-purple-700 hover:to-indigo-600 hover:shadow-md active:scale-95"
                                }
                            `}
                        >
                          {isSaved ? (
                            <>
                              <FaCheck className="text-xs" /> Đã Lưu
                            </>
                          ) : (
                            "Lưu Ngay"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default CouponList;
