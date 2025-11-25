import { FaMinus, FaPlus, FaShoppingCart, FaStar } from "react-icons/fa";
import { Rating } from "react-simple-star-rating";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { userRequest } from "../requestMethods";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addProduct } from "../redux/cartRedux";

const Product = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];

  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  // 1. Fetch Product
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await userRequest.get("/products/find/" + id);
        setProduct(res.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  // 2. Logic Thay đổi số lượng
  const handleQuantity = (action) => {
    if (action === "dec") {
      setQuantity(quantity === 1 ? 1 : quantity - 1);
    }
    if (action === "inc") {
      // Kiểm tra tồn kho nếu có
      if (product.countInStock && quantity >= product.countInStock) {
        toast.warning("Đã đạt giới hạn số lượng trong kho!");
        return;
      }
      setQuantity(quantity + 1);
    }
  };

  // 3. Logic Tính giá (Ưu tiên: Giá sỉ -> Giá giảm -> Giá gốc)
  const calculatePrice = () => {
    if (
      product.wholesalePrice &&
      quantity >= product.wholesaleMinimumQuantity
    ) {
      return product.wholesalePrice;
    }
    if (product.discountedPrice && product.discountedPrice > 0) {
      return product.discountedPrice;
    }
    return product.originalPrice;
  };

  const finalPrice = calculatePrice();

  // 4. Add to Cart
  const handleAddToCart = () => {
    dispatch(
      addProduct({
        _id: product._id, // Dùng _id cho thống nhất
        title: product.title,
        img: product.img,
        price: finalPrice,
        quantity,
      })
    );

    toast.success("Đã thêm vào giỏ hàng!", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu sách...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <ToastContainer />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- PHẦN TRÊN: THÔNG TIN CHI TIẾT --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 flex flex-col md:flex-row gap-10">
          {/* Cột Trái: Ảnh */}
          <div className="w-full md:w-2/5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-gray-100">
              <img
                src={product.img}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Cột Phải: Thông tin */}
          <div className="w-full md:w-3/5 flex flex-col">
            {/* Tiêu đề & Tác giả */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
              <span>
                Tác giả:{" "}
                <span className="text-purple-600 font-medium">
                  {product.author || "Đang cập nhật"}
                </span>
              </span>
              <span className="border-l border-gray-300 pl-4">
                NXB:{" "}
                <span className="text-purple-600 font-medium">
                  {product.publisher || "Đang cập nhật"}
                </span>
              </span>
            </div>

            {/* Đánh giá (Stars) */}
            <div className="flex items-center mb-6">
              <Rating
                initialValue={4.5} // Giá trị trung bình từ DB
                readonly
                size={20}
                fillColor="#fbbf24" // Màu vàng
                allowFraction
              />
              <span className="ml-2 text-sm text-gray-500 underline cursor-pointer hover:text-purple-600">
                (Xem 120 đánh giá)
              </span>
            </div>

            {/* Giá bán */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-extrabold text-red-600">
                  {finalPrice?.toLocaleString("vi-VN")} ₫
                </span>
                {/* Giá gốc gạch ngang nếu có giảm giá */}
                {product.originalPrice > finalPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {product.originalPrice?.toLocaleString("vi-VN")} ₫
                  </span>
                )}
                {/* Badge giảm giá */}
                {product.originalPrice > finalPrice && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full mb-2">
                    -
                    {Math.round((1 - finalPrice / product.originalPrice) * 100)}
                    %
                  </span>
                )}
              </div>

              {/* Thông báo giá sỉ */}
              {product.wholesalePrice && (
                <div className="mt-2 text-sm text-purple-700 font-medium bg-purple-50 inline-block px-3 py-1 rounded-lg border border-purple-200">
                  🔥 Mua từ {product.wholesaleMinimumQuantity} cuốn giá chỉ{" "}
                  {product.wholesalePrice?.toLocaleString()} ₫
                </div>
              )}
            </div>

            {/* Mô tả ngắn (Nếu dài quá thì cắt bớt) */}
            <p className="text-gray-600 leading-relaxed mb-8 line-clamp-4">
              {product.desc}
            </p>

            {/* Bộ chọn số lượng & Nút mua */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              {/* Quantity Input */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantity("dec")}
                  className="px-4 py-2 hover:bg-gray-100 transition text-gray-600"
                >
                  <FaMinus size={12} />
                </button>
                <span className="px-4 py-2 font-semibold text-gray-800 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantity("inc")}
                  className="px-4 py-2 hover:bg-gray-100 transition text-gray-600"
                >
                  <FaPlus size={12} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaShoppingCart className="text-xl" />
                THÊM VÀO GIỎ HÀNG
              </button>
            </div>

            {/* Chính sách cam kết (Trang trí) */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t pt-4">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" /> Cam kết chính hãng
                100%
              </div>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" /> Miễn phí vận chuyển
                đơn 300k
              </div>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" /> Đổi trả trong 7 ngày
              </div>
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" /> Hoàn tiền 200% nếu
                giả
              </div>
            </div>
          </div>
        </div>

        {/* --- PHẦN DƯỚI: MÔ TẢ CHI TIẾT & ĐÁNH GIÁ --- */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">
            Mô Tả Sản Phẩm
          </h2>
          <div className="text-gray-700 leading-loose whitespace-pre-line">
            {product.desc || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">
            Đánh Giá Khách Hàng
          </h2>
          {/* Render list review giả định hoặc từ DB */}
          {product.ratings && product.ratings.length > 0 ? (
            <div className="space-y-6">
              {product.ratings.map((rate, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {rate.name ? rate.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {rate.name || "Người dùng ẩn danh"}
                      </span>
                      <span className="text-xs text-gray-400">
                        • Đã mua hàng
                      </span>
                    </div>
                    <Rating
                      initialValue={rate.star || 5}
                      size={16}
                      readonly
                      fillColor="#fbbf24"
                    />
                    <p className="text-gray-600 mt-2 text-sm">{rate.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
