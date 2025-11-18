import { LineChart } from "@mui/x-charts/LineChart";
import { FaUpload, FaSave, FaChartLine, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { userRequest } from "../requestMethods";
import axios from "axios"; // Cần import axios cho việc upload ảnh
import Swal from "sweetalert2";

const Product = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];

  // State chính
  const [product, setProduct] = useState({});
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);

  // State mới cho việc upload ảnh
  const [newSelectedImage, setNewSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("Sẵn sàng");

  const salesData = [300, 450, 200, 600, 350, 700];
  const months = ["Th.1", "Th.2", "Th.3", "Th.4", "Th.5", "Th.6"];

  // 1. Hàm Tải dữ liệu sản phẩm
  const getProduct = async () => {
    try {
      const res = await userRequest.get("/products/find/" + id);
      setProduct(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  // 2. Xử lý chọn ảnh mới
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewSelectedImage(e.target.files[0]);
      setUploadStatus("Ảnh mới đã chọn.");
    }
  };

  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  // 3. Xử lý Cập nhật Sản phẩm (Bao gồm upload ảnh nếu có)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploadStatus("Đang xử lý...");

    let imgUrl = product.img; // Mặc định dùng ảnh cũ

    try {
      // A. BƯỚC TẢI LÊN ẢNH MỚI (nếu có)
      if (newSelectedImage) {
        setUploadStatus("Đang tải ảnh lên Cloudinary...");
        const data = new FormData();
        data.append("file", newSelectedImage);
        data.append("upload_preset", "uploads"); // Đảm bảo preset này khớp với của bạn

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dkjenslgr/image/upload", // Thay thế dkjenslgr bằng cloud name của bạn
          data
        );
        imgUrl = uploadRes.data.url;
        setUploadStatus("Tải ảnh thành công.");
      }

      // B. BƯỚC CẬP NHẬT THÔNG TIN SẢN PHẨM
      const productData = {
        ...inputs,
        img: imgUrl, // Sử dụng ảnh mới (hoặc ảnh cũ)
      };

      await userRequest.put("/products/" + id, productData);

      Swal.fire(
        "Thành công!",
        "Thông tin sản phẩm đã được cập nhật.",
        "success"
      );

      // Tải lại dữ liệu sản phẩm sau khi cập nhật thành công
      setNewSelectedImage(null);
      setUploadStatus("Hoàn tất.");
      getProduct();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      setUploadStatus("Cập nhật thất bại.");
      Swal.fire("Lỗi!", "Cập nhật sản phẩm thất bại.", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-purple-600">
        Đang tải chi tiết sản phẩm...
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 truncate">
          Chi tiết: {product.title || "Sản phẩm"}
        </h1>
        <Link to="/newproduct">
          <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow transition">
            <FaPlus className="mr-2" /> Tạo mới
          </button>
        </Link>
      </div>

      {/* THÔNG TIN & BIỂU ĐỒ (TOP SECTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Biểu đồ Doanh số */}
        <div className="lg:col-span-2 bg-white p-6 shadow-xl rounded-xl border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-600">
            <FaChartLine className="mr-2" /> Doanh số 6 tháng gần nhất
          </h3>
          <div className="h-[250px] w-full">
            <LineChart
              xAxis={[{ data: months, scaleType: "band" }]}
              series={[{ data: salesData, label: "Doanh thu (VND)" }]}
              height={250}
              margin={{ left: 50, right: 30, top: 30, bottom: 30 }}
              grid={{ vertical: false, horizontal: true }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        </div>

        {/* Product Summary Card */}
        <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-100 flex flex-col items-center text-center">
          <img
            // Hiển thị ảnh mới nếu đã chọn, nếu không thì hiển thị ảnh cũ
            src={
              newSelectedImage
                ? URL.createObjectURL(newSelectedImage)
                : product.img || "https://via.placeholder.com/100"
            }
            alt={product.title}
            className="h-28 w-28 object-cover rounded-full mb-4 ring-4 ring-purple-200"
          />
          <span className="text-2xl font-bold mb-3">{product.title}</span>
          <div className="w-full space-y-2 text-left text-gray-700">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Mã SP:</span>
              <span className="font-mono text-sm">{product._id}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Giá Gốc:</span>
              <span className="font-semibold text-red-500">
                {product.originalPrice?.toLocaleString("vi-VN") || "N/A"} VND
              </span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Tồn kho:</span>
              <span
                className={`font-semibold ${
                  product.inStock ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.inStock ? "CÒN HÀNG" : "HẾT HÀNG"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM CẬP NHẬT (BOTTOM SECTION) */}
      <div className="bg-white p-8 shadow-xl rounded-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Chỉnh sửa Thông tin
        </h2>
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"
        >
          {/* CỘT TRÁI: Thông tin cơ bản */}
          <div className="space-y-6">
            {/* ... Các input khác không đổi ... */}
            <div>
              <label
                htmlFor="title"
                className="block mb-2 font-semibold text-gray-700"
              >
                Tên Sản phẩm
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder={product.title}
                defaultValue={product.title}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="desc"
                className="block mb-2 font-semibold text-gray-700"
              >
                Mô tả
              </label>
              <textarea
                id="desc"
                name="desc"
                placeholder={product.desc}
                defaultValue={product.desc}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="originalPrice"
                  className="block mb-2 font-semibold text-gray-700"
                >
                  Giá Gốc (VND)
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  placeholder={product.originalPrice}
                  defaultValue={product.originalPrice}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="discountedPrice"
                  className="block mb-2 font-semibold text-gray-700"
                >
                  Giá Khuyến Mãi (VND)
                </label>
                <input
                  type="number"
                  id="discountedPrice"
                  name="discountedPrice"
                  placeholder={product.discountedPrice}
                  defaultValue={product.discountedPrice}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="inStock"
                className="block mb-2 font-semibold text-gray-700"
              >
                Trạng thái Tồn kho
              </label>
              <select
                id="inStock"
                name="inStock"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                defaultValue={product.inStock ? "true" : "false"}
                onChange={handleChange}
              >
                <option value="true">Còn hàng (In Stock)</option>
                <option value="false">Hết hàng (Out of Stock)</option>
              </select>
            </div>
          </div>

          {/* CỘT PHẢI: Hình ảnh và Nút Lưu */}
          <div className="flex flex-col items-center space-y-6 md:mt-10">
            <div className="flex flex-col items-center">
              <img
                // Hiển thị ảnh mới nếu đã chọn, nếu không thì hiển thị ảnh cũ
                src={
                  newSelectedImage
                    ? URL.createObjectURL(newSelectedImage)
                    : product.img || "https://via.placeholder.com/160"
                }
                alt={product.title}
                className="h-40 w-40 object-cover rounded-lg shadow-md ring-1 ring-gray-200"
              />

              <p className="mt-2 text-sm text-gray-500">
                Trạng thái:
                <span
                  className={`font-semibold ${
                    uploadStatus.includes("thành công")
                      ? "text-green-600"
                      : uploadStatus.includes("thất bại")
                      ? "text-red-500"
                      : "text-purple-600"
                  }`}
                >
                  {" "}
                  {uploadStatus}
                </span>
              </p>

              <label
                htmlFor="file-upload"
                className="cursor-pointer mt-4 flex items-center text-purple-600 hover:text-purple-800"
              >
                <FaUpload className="text-xl mr-2" /> Tải lên ảnh mới
              </label>
              <input
                type="file"
                id="file-upload"
                style={{ display: "none" }}
                onChange={handleImageChange} // GỌI HÀM XỬ LÝ ẢNH
                accept="image/*"
              />
            </div>

            {/* Nút Cập nhật */}
            <button
              type="submit"
              className="w-full md:w-3/4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300"
            >
              <FaSave className="mr-2" /> Cập Nhật Sản Phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Product;
