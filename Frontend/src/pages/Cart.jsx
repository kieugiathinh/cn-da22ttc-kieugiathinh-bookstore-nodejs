import { FaMinus, FaPlus, FaTrashAlt, FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeProduct, updateQuantity } from "../redux/cartRedux";
import { userRequest } from "../requestMethods";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // --- HANDLERS ---
  const handleRemoveProduct = (productId) => {
    dispatch(removeProduct(productId)); // Truyền ID thay vì cả object product
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
      dispatch(clearCart());
      toast.info("Đã dọn sạch giỏ hàng");
    }
  };

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      // Nếu giảm xuống 0 thì hỏi xóa
      if (window.confirm("Bạn muốn xóa sản phẩm này?")) {
        handleRemoveProduct(productId);
      }
      return;
    }

    dispatch(
      updateQuantity({
        _id: productId,
        quantity: newQuantity,
      })
    );
  };

  const handleCheckout = async () => {
    if (!user.currentUser) {
      toast.error("Vui lòng đăng nhập để thanh toán!");
      return;
    }

    if (cart.products.length === 0) {
      toast.warning("Giỏ hàng đang trống!");
      return;
    }

    try {
      const res = await userRequest.post("/stripe/create-checkout-session", {
        cart,
        userId: user.currentUser._id,
        email: user.currentUser.email,
        name: user.currentUser.fullname || user.currentUser.name, // Lấy fullname hoặc name
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Thanh toán thất bại. Vui lòng thử lại sau.");
    }
  };

  // --- CALCULATIONS ---
  const subtotal = cart.total || 0;
  const shipping = subtotal > 0 ? 30000 : 0; // Phí ship cố định 30k hoặc tùy logic
  const total = subtotal + shipping;

  // --- EMPTY CART UI ---
  if (cart.products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png"
          alt="Empty Cart"
          className="w-64 h-64 object-contain mb-6 opacity-80"
        />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-6">
          Hãy thêm vài cuốn sách hay ho vào nhé!
        </p>
        <Link to="/">
          <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition shadow-lg flex items-center">
            <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
          Giỏ Hàng{" "}
          <span className="text-lg font-normal text-gray-500 ml-2">
            ({cart.quantity} sản phẩm)
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- LEFT COLUMN: PRODUCT LIST --- */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header Bảng (Ẩn trên mobile) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold text-sm">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="divide-y divide-gray-100">
                {cart.products?.map((product) => (
                  <div
                    key={product._id}
                    className="p-4 sm:grid sm:grid-cols-12 gap-4 items-center hover:bg-gray-50 transition"
                  >
                    {/* Cột 1: Ảnh & Tên */}
                    <div className="col-span-6 flex items-center space-x-4 mb-4 sm:mb-0">
                      <img
                        src={product.img}
                        alt={product.title}
                        className="w-20 h-24 object-cover rounded-md shadow-sm border border-gray-200"
                      />
                      <div>
                        <h3 className="text-base font-bold text-gray-800 line-clamp-2 mb-1">
                          <Link
                            to={`/product/${product._id}`}
                            className="hover:text-purple-600 transition"
                          >
                            {product.title}
                          </Link>
                        </h3>
                        <button
                          onClick={() => handleRemoveProduct(product._id)}
                          className="text-sm text-red-500 hover:text-red-700 flex items-center mt-2 transition"
                        >
                          <FaTrashAlt className="mr-1" /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Cột 2: Đơn giá */}
                    <div className="col-span-2 text-center text-gray-600 font-medium hidden sm:block">
                      {product.price?.toLocaleString("vi-VN")} ₫
                    </div>

                    {/* Cột 3: Số lượng */}
                    <div className="col-span-2 flex justify-center items-center">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              product._id,
                              product.quantity,
                              -1
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition rounded-l-lg"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="px-3 py-1 font-semibold text-gray-700 border-l border-r border-gray-300 min-w-[40px] text-center">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              product._id,
                              product.quantity,
                              1
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition rounded-r-lg"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Cột 4: Thành tiền */}
                    <div className="col-span-2 text-right font-bold text-purple-600 text-lg mt-4 sm:mt-0">
                      {(product.price * product.quantity).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút xóa tất cả */}
            <div className="mt-6 flex justify-between items-center">
              <Link
                to="/"
                className="text-purple-600 hover:text-purple-800 font-semibold flex items-center transition"
              >
                <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
              </Link>
              <button
                onClick={handleClearCart}
                className="text-gray-500 hover:text-red-500 transition text-sm font-semibold border border-gray-300 px-4 py-2 rounded-lg hover:border-red-500"
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="w-full lg:w-96">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {shipping > 0
                      ? `${shipping.toLocaleString("vi-VN")} ₫`
                      : "Miễn phí"}
                  </span>
                </div>
                {/* Thêm mã giảm giá nếu có */}
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
                <span className="text-lg font-bold text-gray-800">
                  Tổng cộng
                </span>
                <span className="text-2xl font-extrabold text-red-600">
                  {total.toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:-translate-y-0.5 active:scale-95"
              >
                THANH TOÁN NGAY
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Chấp nhận thanh toán qua thẻ Visa, Master, MoMo...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
