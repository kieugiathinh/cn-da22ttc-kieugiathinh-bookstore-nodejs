import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { userRequest } from "../requestMethods";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/cartRedux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

const Checkout = () => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State lưu thông tin giao hàng
  const [inputs, setInputs] = useState({
    name: user?.fullname || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // Mặc định là COD

  // Cập nhật input
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- XỬ LÝ ĐẶT HÀNG ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 1. Validate dữ liệu
    if (!inputs.name || !inputs.phone || !inputs.address) {
      toast.warning("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // Dữ liệu đơn hàng chuẩn bị gửi
    const orderData = {
      userId: user._id,
      products: cart.products.map((item) => ({
        productId: item._id,
        title: item.title,
        img: item.img,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cart.total, // Lưu ý: Đảm bảo key này khớp với Model (total hoặc amount)
      ...inputs, // name, email, phone, address
      paymentMethod: paymentMethod,
    };

    // 2. Logic theo từng phương thức
    if (paymentMethod === "COD") {
      // --- THANH TOÁN TIỀN MẶT (COD) ---
      try {
        // Gọi API tạo đơn hàng luôn
        await userRequest.post("/orders", { ...orderData, status: 0 }); // Status 0: Chờ xử lý

        // Thành công -> Xóa giỏ hàng -> Chuyển trang
        dispatch(clearCart());
        navigate("/myorders");
        alert("Đặt hàng thành công!"); // Hoặc dùng Toast
      } catch (err) {
        console.log(err);
        toast.error("Đặt hàng thất bại!");
      }
    } else if (paymentMethod === "Stripe") {
      // --- THANH TOÁN ONLINE (STRIPE) ---
      try {
        // QUAN TRỌNG: Lưu thông tin giao hàng vào LocalStorage tạm thời
        // Để trang Success.jsx có thể đọc được và tạo đơn hàng sau khi thanh toán xong
        localStorage.setItem("tempOrderData", JSON.stringify(inputs));

        // Gọi API lấy link thanh toán Stripe
        const res = await userRequest.post("/stripe/create-checkout-session", {
          cart,
          userId: user._id,
          email: inputs.email,
          name: inputs.name,
        });

        if (res.data.url) {
          window.location.href = res.data.url; // Chuyển hướng sang Stripe
        }
      } catch (err) {
        console.log(err);
        toast.error("Lỗi kết nối Stripe!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG --- */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thông tin giao hàng
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={inputs.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={inputs.phone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:border-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ nhận hàng
                </label>
                <input
                  type="text"
                  name="address"
                  value={inputs.address}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg outline-none focus:border-purple-500"
                />
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Phương thức thanh toán
            </h2>
            <div className="space-y-3">
              {/* COD OPTION */}
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  paymentMethod === "COD"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="w-5 h-5 text-purple-600"
                />
                <div className="ml-4 flex items-center">
                  <FaMoneyBillWave className="text-green-600 text-2xl mr-3" />
                  <div>
                    <span className="block font-bold text-gray-800">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-sm text-gray-500">
                      Bạn chỉ phải thanh toán khi nhận được hàng
                    </span>
                  </div>
                </div>
              </label>

              {/* STRIPE OPTION */}
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                  paymentMethod === "Stripe"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Stripe"
                  checked={paymentMethod === "Stripe"}
                  onChange={() => setPaymentMethod("Stripe")}
                  className="w-5 h-5 text-purple-600"
                />
                <div className="ml-4 flex items-center">
                  <FaCreditCard className="text-blue-600 text-2xl mr-3" />
                  <div>
                    <span className="block font-bold text-gray-800">
                      Thanh toán Online (Visa/Mastercard)
                    </span>
                    <span className="text-sm text-gray-500">
                      Thanh toán bảo mật qua cổng Stripe
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Đơn hàng của bạn
            </h2>
            <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
              {cart.products.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <img
                      src={item.img}
                      alt=""
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-2 w-32">
                        {item.title}
                      </p>
                      <p className="text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-700">
                    {(item.price * item.quantity).toLocaleString()} ₫
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{cart.total?.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>30.000 ₫</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-purple-600 border-t pt-2 mt-2">
                <span>Tổng cộng</span>
                <span>{(cart.total + 30000).toLocaleString()} ₫</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full bg-purple-600 text-white py-3 rounded-lg mt-6 font-bold hover:bg-purple-700 transition shadow-lg"
            >
              {paymentMethod === "COD" ? "ĐẶT HÀNG NGAY" : "THANH TOÁN STRIPE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
