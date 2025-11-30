import {
  FaCheckCircle,
  FaShippingFast,
  FaMapMarkerAlt,
  FaCreditCard,
  FaStar,
  FaArrowLeft,
} from "react-icons/fa";
import { Rating } from "react-simple-star-rating";
import { useState, useEffect } from "react";
import { userRequest } from "../requestMethods";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Order = () => {
  const user = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho phần đánh giá
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const getUserOrder = async () => {
      try {
        const res = await userRequest.get(
          `/orders/find/${user.currentUser._id}`
        );
        setOrders(res.data);
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

  // Xử lý gửi đánh giá
  const handleSubmitReview = async () => {
    if (!rating) {
      toast.warning("Vui lòng chọn số sao!");
      return;
    }
    try {
      await userRequest.post(`/products/rating/${selectedProduct}`, {
        star: rating,
        comment: comment,
        name: user.currentUser.fullname,
        postedBy: user.currentUser._id,
      });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setShowReviewModal(false);
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error("Lỗi khi gửi đánh giá");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải lịch sử đơn hàng...</div>;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png"
          className="w-48 opacity-50 mb-4"
          alt=""
        />
        <h2 className="text-xl font-bold text-gray-600 mb-4">
          Bạn chưa có đơn hàng nào
        </h2>
        <Link to="/">
          <button className="bg-purple-600 text-white px-6 py-2 rounded-full">
            Mua sắm ngay
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Lịch Sử Đơn Hàng
          </h1>
          <p className="text-gray-600 mt-2">
            Cảm ơn bạn đã tin tưởng và mua sắm tại GTBooks!
          </p>
        </div>

        <div className="space-y-8">
          {orders.map((order, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100"
            >
              {/* Header Đơn hàng */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Đơn hàng #{order._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 2
                        ? "bg-green-100 text-green-700"
                        : order.status === 3
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status === 0
                      ? "Chờ xác nhận"
                      : order.status === 1
                      ? "Đang giao"
                      : order.status === 2
                      ? "Đã giao"
                      : "Đã hủy"}
                  </span>
                  <span className="font-bold text-red-600 text-lg">
                    {order.total?.toLocaleString()} ₫
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
                <div className="lg:col-span-2 space-y-6">
                  {order.products?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img
                        src={item.img || "/placeholder.jpg"}
                        alt=""
                        className="w-20 h-24 object-cover rounded-md border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">
                            x{item.quantity}
                          </span>
                          <span className="font-bold text-gray-700">
                            {item.price?.toLocaleString()} ₫
                          </span>
                        </div>
                        {/* Nút Đánh giá chỉ hiện khi đã giao thành công */}
                        {order.status === 2 && (
                          <button
                            onClick={() => {
                              setSelectedProduct(item.productId); // Cần chắc chắn item có productId
                              setShowReviewModal(true);
                            }}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium mt-2 flex items-center"
                          >
                            <FaStar className="mr-1" /> Viết đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CỘT PHẢI: THÔNG TIN GIAO HÀNG */}
                <div className="bg-gray-50 p-5 rounded-lg space-y-4 h-fit">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                      <FaMapMarkerAlt className="text-gray-400 mr-2" /> Địa chỉ
                      nhận hàng
                    </h3>
                    <p className="text-sm text-gray-600">{order.name}</p>
                    <p className="text-sm text-gray-600">
                      {order.phone || user.currentUser.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.address || user.currentUser.address}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                      <FaCreditCard className="text-gray-400 mr-2" /> Thanh toán
                    </h3>
                    <p className="text-sm text-gray-600">
                      Phương thức: Visa/Mastercard
                    </p>
                    <p className="text-sm text-gray-600">
                      Trạng thái:{" "}
                      <span className="text-green-600 font-semibold">
                        Đã thanh toán
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition transform flex items-center justify-center mx-auto">
              <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </div>

      {/* --- MODAL ĐÁNH GIÁ --- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Đánh giá sản phẩm
            </h3>

            <div className="flex justify-center mb-4">
              <Rating
                onClick={(rate) => setRating(rate)}
                initialValue={rating}
                size={35}
                transition
                fillColor="#fbbf24"
              />
            </div>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
              rows="4"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 shadow-md"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
