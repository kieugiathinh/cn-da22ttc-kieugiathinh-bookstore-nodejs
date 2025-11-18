import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import axios from "axios";
import { userRequest } from "../requestMethods";
import { useState } from "react";
import Swal from "sweetalert2"; // Dùng để thông báo

// Dữ liệu thể loại sách giả định (Admin có thể fetch từ API thực tế)
const BOOK_CATEGORIES = [
  "Tiểu thuyết",
  "Kinh tế",
  "Tâm lý - Kỹ năng sống",
  "Khoa học",
  "Lịch sử",
  "Văn học nước ngoài",
  "Truyện tranh",
  "Thiếu nhi",
  "Huyền ảo",
];

const NewProduct = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputs, setInputs] = useState({});
  const [uploadStatus, setUploadStatus] = useState("Sẵn sàng tải ảnh");

  // Thay thế concern/skintype bằng categories (Mảng Thể loại được chọn)
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 1. Xử lý chọn ảnh
  const imageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // 2. Xử lý chọn Thể loại (Thêm vào mảng)
  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value && !selectedCategories.includes(value)) {
      setSelectedCategories((prev) => [...prev, value]);
      // Reset select box về default sau khi chọn
      e.target.value = "";
    }
  };

  // 3. Xử lý xóa Thể loại khỏi mảng
  const handleRemoveCategory = (value) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== value));
  };

  // 4. Xử lý thay đổi Input thông thường
  const handleChange = (e) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  // 5. Xử lý Tải lên và Tạo Sản phẩm
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      Swal.fire("Lỗi", "Vui lòng chọn ảnh bìa sách.", "warning");
      return;
    }

    setUploadStatus("Đang tải ảnh lên Cloudinary...");
    const data = new FormData();
    data.append("file", selectedImage);
    data.append("upload_preset", "uploads");

    try {
      // BƯỚC 1: UPLOAD ẢNH
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dkjenslgr/image/upload",
        data
      );

      const { url } = uploadRes.data;

      // BƯỚC 2: TẠO SẢN PHẨM TRONG DB
      setUploadStatus("Đang lưu sách vào DB...");
      await userRequest.post("/products", {
        img: url,
        ...inputs,
        // Gửi mảng thể loại đã chọn
        categories: selectedCategories,
        // Đảm bảo inStock là boolean
        inStock: inputs.inStock === "true",
      });

      Swal.fire("Thành công!", "Sản phẩm mới đã được tạo.", "success");
      setUploadStatus("Hoàn tất!");
      // Bạn có thể reset form tại đây nếu cần
      setInputs({});
      setSelectedImage(null);
      setSelectedCategories([]);
    } catch (error) {
      console.error(error);
      setUploadStatus("Tải lên thất bại 😔");
      Swal.fire(
        "Lỗi!",
        "Tạo sản phẩm thất bại. Vui lòng kiểm tra console.",
        "error"
      );
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 h-full overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          ➕ Thêm Sản Phẩm Mới
        </h1>
      </div>

      {/* FORM TẠO SẢN PHẨM */}
      <div className="bg-white p-8 shadow-xl rounded-xl border border-gray-100">
        <form
          onSubmit={handleUpload}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"
        >
          {/* CỘT TRÁI: Thông tin cơ bản và Giá */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">
              Thông tin Cơ bản
            </h2>

            {/* Tên sách */}
            <div>
              <label
                htmlFor="title"
                className="block mb-2 font-semibold text-gray-700"
              >
                Tên Sách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Ví dụ: Đắc Nhân Tâm"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label
                htmlFor="desc"
                className="block mb-2 font-semibold text-gray-700"
              >
                Mô tả chi tiết
              </label>
              <textarea
                name="desc"
                id="desc"
                rows="5"
                placeholder="Nhập nội dung tóm tắt hoặc chi tiết về cuốn sách..."
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Giá Gốc */}
              <div>
                <label
                  htmlFor="originalPrice"
                  className="block mb-2 font-semibold text-gray-700"
                >
                  Giá Gốc (VND)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  placeholder="250000"
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              {/* Giá Khuyến Mãi */}
              <div>
                <label
                  htmlFor="discountedPrice"
                  className="block mb-2 font-semibold text-gray-700"
                >
                  Giá Khuyến Mãi (VND)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  placeholder="200000"
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Tồn kho */}
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
                onChange={handleChange}
                defaultValue={"true"}
              >
                <option value="true">Còn hàng (In Stock)</option>
                <option value="false">Hết hàng (Out of Stock)</option>
              </select>
            </div>
          </div>

          {/* CỘT PHẢI: Hình ảnh và Thuộc tính Sách */}
          <div className="space-y-6 md:mt-0">
            <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">
              Ảnh & Phân loại
            </h2>

            {/* Input Ảnh */}
            <div>
              <label
                htmlFor="file"
                className="font-semibold text-gray-700 block mb-2"
              >
                Ảnh Bìa:
              </label>
              <div className="flex items-center space-x-4">
                <div className="border-2 h-32 w-24 border-purple-300 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                  {!selectedImage ? (
                    <label
                      htmlFor="file"
                      className="cursor-pointer text-purple-500 hover:text-purple-700 flex flex-col items-center"
                    >
                      <FaPlus className="text-xl" />
                      <span className="text-xs mt-1">Chọn ảnh</span>
                    </label>
                  ) : (
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Book Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <input
                  type="file"
                  id="file"
                  onChange={imageChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
                <span
                  className={`text-sm font-medium ${
                    uploadStatus.includes("thành công")
                      ? "text-green-600"
                      : uploadStatus.includes("thất bại")
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  Trạng thái: {uploadStatus}
                </span>
              </div>
            </div>

            {/* Tác giả */}
            <div>
              <label
                htmlFor="author"
                className="block mb-2 font-semibold text-gray-700"
              >
                Tác giả
              </label>
              <input
                type="text"
                name="author"
                placeholder="Tác giả"
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Nhà xuất bản */}
            <div>
              <label
                htmlFor="publisher"
                className="block mb-2 font-semibold text-gray-700"
              >
                Nhà xuất bản
              </label>
              <input
                type="text"
                name="publisher"
                placeholder="Nhà xuất bản"
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Chọn Thể loại */}
            <div>
              <label
                htmlFor="category"
                className="block mb-2 font-semibold text-gray-700"
              >
                Thể loại (Chọn nhiều)
              </label>
              <select
                name="categories"
                id="category"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                onChange={handleCategorySelect}
                defaultValue={""}
              >
                <option value="" disabled>
                  Chọn thể loại sách...
                </option>
                {BOOK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Hiển thị và xóa Thể loại đã chọn */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedCategories.map((option) => (
                <span
                  key={option}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full"
                >
                  {option}
                  <FaTrash
                    className="cursor-pointer text-red-500 text-xs ml-2 hover:text-red-700 transition"
                    onClick={() => handleRemoveCategory(option)}
                  />
                </span>
              ))}
            </div>

            {/* Nút Tạo Sản phẩm */}
            <button
              type="submit"
              className="w-full mt-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300"
              disabled={!selectedImage || uploadStatus.includes("Đang tải")}
            >
              <FaSave className="mr-2" /> TẠO SẢN PHẨM MỚI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
