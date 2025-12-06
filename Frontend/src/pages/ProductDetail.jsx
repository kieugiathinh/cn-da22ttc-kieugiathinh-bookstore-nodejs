import { FaMinus, FaPlus, FaShoppingCart, FaStar } from "react-icons/fa";
import { Rating } from "react-simple-star-rating";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { userRequest } from "../requestMethods";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../redux/cartRedux";
import { toast } from "sonner";

const Product = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];

  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

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
      if (product.countInStock && quantity >= product.countInStock) {
        toast.warning(`Chỉ còn ${product.countInStock} sản phẩm trong kho!`);
        return;
      }
      setQuantity(quantity + 1);
    }
  };

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
    if (product.countInStock === 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    dispatch(
      addProduct({
        _id: product._id,
        title: product.title,
        img: product.img,
        price: finalPrice,
        quantity,
      })
    );

    toast.success("Đã thêm vào giỏ hàng!", {
      description: `${product.title} x ${quantity}`,
    });
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu sách...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* --- FIX LỖI RATING --- */}
            <div className="flex items-center mb-6">
              {/* BỌC BẰNG DIV FLEX ĐỂ ÉP NẰM NGANG */}
              <div className="flex flex-row items-center">
                <Rating
                  initialValue={4.5}
                  readonly
                  size={20}
                  fillColor="#fbbf24"
                  allowFraction
                  SVGstyle={{ display: "inline" }} // Thêm dòng này để chắc chắn icon SVG là inline
                />
              </div>
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
                {product.originalPrice > finalPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {product.originalPrice?.toLocaleString("vi-VN")} ₫
                  </span>
                )}
                {product.originalPrice > finalPrice && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full mb-2">
                    -
                    {Math.round((1 - finalPrice / product.originalPrice) * 100)}
                    %
                  </span>
                )}
              </div>

              {/* --- HIỂN THỊ TỒN KHO (ĐƠN GIẢN HÓA) --- */}
              <div className="mt-3 flex items-center text-sm">
                <span className="text-gray-500 mr-2">Tình trạng:</span>
                {product.countInStock > 0 ? (
                  <span className="text-green-600 font-medium flex items-center">
                    Còn hàng{" "}
                    <span className="text-gray-400 ml-1 text-xs">
                      (Sẵn {product.countInStock})
                    </span>
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Hết hàng</span>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 line-clamp-4">
              {product.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
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

              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                        ${
                          product.countInStock > 0
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:scale-[1.02]"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
              >
                <FaShoppingCart className="text-xl" />
                {product.countInStock > 0 ? "THÊM VÀO GIỎ HÀNG" : "HẾT HÀNG"}
              </button>
            </div>

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

        {/* --- PHẦN DƯỚI: MÔ TẢ & REVIEW --- */}
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
                    {/* FIX LỖI SAO Ở ĐÂY */}
                    <div className="flex flex-row">
                      <Rating
                        initialValue={rate.star || 5}
                        size={16}
                        readonly
                        fillColor="#fbbf24"
                        SVGstyle={{ display: "inline" }} // Ép inline cho SVG
                      />
                    </div>
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
