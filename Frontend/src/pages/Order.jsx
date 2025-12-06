import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaShippingFast,
  FaBoxOpen,
  FaPen,
  FaTimesCircle, // Import thêm icon Hủy
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { userRequest } from "../requestMethods";
import { useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating";
import { toast } from "sonner";
import Swal from "sweetalert2";

const Order = () => {
  const user = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratingData, setRatingData] = useState({});
  const [showRatingFor, setShowRatingFor] = useState(null);

  // 1. Fetch Orders
  useEffect(() => {
    const getUserOrder = async () => {
      try {
        const res = await userRequest.get(
          `/orders/find/${user.currentUser._id}`
        );
        // Sắp xếp mới nhất lên đầu
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

  // 2. Handle Rating
  const handleRatingChange = (productId, field, value) => {
    setRatingData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

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
      setShowRatingFor(null);
    } catch (error) {
      toast.error("Lỗi khi gửi đánh giá.");
    }
  };

  // 3. HÀM HỦY ĐƠN (Bạn đã có, mình giữ nguyên logic)
  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Hủy đơn hàng?",
      text: "Bạn có chắc chắn muốn hủy đơn này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý hủy",
      cancelButtonText: "Giữ lại",
    });

    if (result.isConfirmed) {
      try {
        await userRequest.put(`/orders/${orderId}/cancel`);
        toast.success("Đã hủy đơn hàng thành công");

        // Cập nhật UI ngay lập tức (Optomistic Update) thay vì reload trang
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: 3 } : order
          )
        );
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
      }
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Lịch Sử Đơn Hàng
          </h1>
        </div>

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

                {/* --- KHU VỰC TRẠNG THÁI & NÚT HỦY --- */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      order.status === 2
                        ? "bg-green-100 text-green-700" // Giao thành công
                        : order.status === 3
                        ? "bg-red-100 text-red-700" // Đã hủy
                        : order.status === 1
                        ? "bg-blue-100 text-blue-700" // Đã thanh toán
                        : "bg-yellow-100 text-yellow-700" // Chờ xác nhận (0)
                    }`}
                  >
                    {order.status === 0
                      ? "Chờ xác nhận"
                      : order.status === 1
                      ? "Đang xử lý"
                      : order.status === 2
                      ? "Giao thành công"
                      : "Đã hủy"}
                  </span>

                  {/* NÚT HỦY: Chỉ hiện khi status là 0 (Chờ xác nhận) */}
                  {order.status === 0 && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200 transition flex items-center"
                      title="Hủy đơn hàng này"
                    >
                      <FaTimesCircle className="mr-1" /> Hủy Đơn
                    </button>
                  )}
                </div>
                {/* ----------------------------------- */}
              </div>

              {/* Body Đơn hàng */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột Trái: Sản phẩm */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                    <FaBoxOpen className="mr-2 text-purple-500" /> Sản phẩm (
                    {order.products?.length || 0})
                  </h3>

                  {order.products?.map((item, idx) => (
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

                          {/* Nút đánh giá (Chỉ hiện khi giao thành công - Status 2) */}
                          {order.status === 2 && (
                            <button
                              onClick={() =>
                                setShowRatingFor(
                                  showRatingFor === item.productId
                                    ? null
                                    : item.productId
                                )
                              }
                              className="mt-3 text-xs flex items-center text-gray-500 hover:text-purple-600 transition font-medium"
                            >
                              <FaPen className="mr-1.5" />
                              {showRatingFor === item.productId
                                ? "Đóng đánh giá"
                                : "Viết đánh giá"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Form Đánh giá */}
                      {showRatingFor === item.productId && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 animate-fadeIn">
                          {/* ... (Code form đánh giá giữ nguyên) ... */}
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <Rating
                                onClick={(rate) =>
                                  handleRatingChange(
                                    item.productId,
                                    "star",
                                    rate
                                  )
                                }
                                size={24}
                                fillColor="#fbbf24"
                                initialValue={
                                  ratingData[item.productId]?.star || 0
                                }
                                style={{ display: "flex" }}
                              />
                            </div>
                            <textarea
                              rows="3"
                              placeholder="Chia sẻ cảm nhận..."
                              className="w-full text-sm p-3 border border-gray-300 rounded-lg outline-none"
                              onChange={(e) =>
                                handleRatingChange(
                                  item.productId,
                                  "comment",
                                  e.target.value
                                )
                              }
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => submitRating(item.productId)}
                                className="bg-purple-600 text-white text-sm font-bold py-2 px-6 rounded-lg"
                              >
                                Gửi
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
                      <p>{order.phone || "Chưa cập nhật"}</p>
                      <p>{order.address || order.email}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                      Thanh toán
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Phương thức</span>
                        <span className="font-medium text-gray-800">
                          {order.paymentMethod || "COD"}
                        </span>
                      </div>
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
