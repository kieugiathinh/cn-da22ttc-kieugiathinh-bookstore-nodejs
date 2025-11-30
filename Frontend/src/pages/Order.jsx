import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaShippingFast,
  FaBoxOpen,
  FaStar,
  FaPen,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { userRequest } from "../requestMethods";
import { useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating"; // Dùng thư viện Rating của bạn
import { toast } from "sonner"; // Dùng Sonner cho đẹp

const Order = () => {
  const user = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho phần đánh giá (Lưu theo ID sản phẩm để không bị trùng)
  const [ratingData, setRatingData] = useState({}); // { "sp_id": { star: 5, comment: "" } }
  const [showRatingFor, setShowRatingFor] = useState(null); // ID sản phẩm đang mở form đánh giá

  useEffect(() => {
    const getUserOrder = async () => {
      try {
        const res = await userRequest.get(
          `/orders/find/${user.currentUser._id}`
        );
        // Sắp xếp đơn mới nhất lên đầu
        setOrders(
          res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    if (user.currentUser) {
      getUserOrder();
    }
  }, [user]);

  // Xử lý nhập đánh giá
  const handleRatingChange = (productId, field, value) => {
    setRatingData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Gửi đánh giá
  const submitRating = async (productId) => {
    const data = ratingData[productId];
    if (!data || !data.star) {
      toast.warning("Vui lòng chọn số sao đánh giá!");
      return;
    }

    try {
      const singleRating = {
        star: data.star,
        name: user.currentUser.fullname || user.currentUser.name,
        postedBy: user.currentUser._id,
        comment: data.comment || "",
      };

      await userRequest.put(`/products/ratings/${productId}`, singleRating);
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      setShowRatingFor(null); // Đóng form
    } catch (error) {
      toast.error("Lỗi khi gửi đánh giá.");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải lịch sử đơn hàng...
      </div>
    );

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <FaBoxOpen className="text-gray-300 text-9xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-600">
          Bạn chưa có đơn hàng nào
        </h2>
        <Link
          to="/"
          className="mt-6 px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition shadow-lg"
        >
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Trang */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Lịch Sử Đơn Hàng
          </h1>
          <p className="text-gray-500 mt-2">
            Xem lại và theo dõi các đơn hàng của bạn
          </p>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="space-y-8">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header Đơn hàng */}
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Đơn hàng
                  </span>
                  <p className="font-mono text-sm font-bold text-gray-800">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ngày đặt
                  </span>
                  <p className="text-sm text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tổng tiền
                  </span>
                  <p className="text-base font-bold text-purple-600">
                    {order.total?.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      order.status === 2
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status === 2 ? "Giao thành công" : "Đang xử lý"}
                  </span>
                </div>
              </div>

              {/* Body Đơn hàng */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột Trái: Danh sách sản phẩm */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                    <FaBoxOpen className="mr-2 text-purple-500" /> Sản phẩm (
                    {order.products.length})
                  </h3>

                  {order.products.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-b border-gray-50 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-20 h-28 object-cover rounded-md border border-gray-200 shadow-sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 line-clamp-2 text-sm sm:text-base">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Số lượng:{" "}
                            <span className="font-medium text-gray-900">
                              {item.quantity}
                            </span>
                          </p>
                          <p className="text-sm text-purple-600 font-bold mt-1">
                            {item.price?.toLocaleString("vi-VN")} ₫
                          </p>

                          {/* Nút viết đánh giá (Chỉ hiện khi giao thành công) */}
                          {/* Nếu muốn hiện luôn thì bỏ điều kiện order.status === 2 */}
                          <button
                            onClick={() =>
                              setShowRatingFor(
                                showRatingFor === item._id ? null : item._id
                              )
                            }
                            className="mt-3 text-xs flex items-center text-gray-500 hover:text-purple-600 transition font-medium"
                          >
                            <FaPen className="mr-1.5" />
                            {showRatingFor === item._id
                              ? "Đóng đánh giá"
                              : "Viết đánh giá"}
                          </button>
                        </div>
                      </div>

                      {/* Form Đánh giá (Ẩn/Hiện) */}
                      {showRatingFor === item._id && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 animate-fadeIn">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                            Đánh giá sản phẩm này
                          </p>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <Rating
                                onClick={(rate) =>
                                  handleRatingChange(item._id, "star", rate)
                                }
                                size={24}
                                fillColor="#fbbf24"
                                initialValue={ratingData[item._id]?.star || 0}
                                style={{ display: "flex" }}
                              />
                              <span className="text-sm text-gray-500 font-medium">
                                {ratingData[item._id]?.star
                                  ? `${ratingData[item._id]?.star} sao`
                                  : "Chọn sao"}
                              </span>
                            </div>
                            <textarea
                              rows="3"
                              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                              className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                              onChange={(e) =>
                                handleRatingChange(
                                  item._id,
                                  "comment",
                                  e.target.value
                                )
                              }
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => submitRating(item._id)}
                                className="bg-purple-600 text-white text-sm font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition shadow-sm"
                              >
                                Gửi Đánh Giá
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cột Phải: Thông tin giao hàng */}
                <div className="space-y-6 border-l border-gray-100 lg:pl-8">
                  <div>
                    <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                      <FaShippingFast className="mr-2 text-blue-500" /> Giao
                      hàng tới
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1.5">
                      <p className="font-bold text-gray-800">
                        {order.name || user.currentUser.fullname}
                      </p>
                      <p>{order.phone || "0339..."}</p>
                      <p>{order.address || order.email}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                      Thanh toán
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính</span>
                        <span>
                          {(order.total - 30000)?.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span>30.000 ₫</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2 mt-2">
                        <span>Tổng cộng</span>
                        <span className="text-lg text-purple-600">
                          {order.total?.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/">
            <button className="bg-white border-2 border-purple-600 text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-50 transition">
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Order;
