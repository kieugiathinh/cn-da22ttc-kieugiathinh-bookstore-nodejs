import {
  FaBook,
  FaList,
  FaClipboardList,
  FaElementor,
  FaHome,
  FaSignOutAlt,
  FaUsers,
  FaBolt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Menu = () => {
  const location = useLocation();

  const menuGroups = [
    {
      title: "TỔNG QUAN",
      items: [{ path: "/", icon: <FaHome />, label: "Trang chủ" }],
    },
    {
      title: "QUẢN LÝ",
      items: [
        { path: "/users", icon: <FaUsers />, label: "Người dùng" },
        { path: "/flash-sales", icon: <FaBolt />, label: "Flash Sale" },
        { path: "/categories", icon: <FaList />, label: "Thể loại" },
        { path: "/products", icon: <FaBook />, label: "Sản phẩm" },
        { path: "/orders", icon: <FaClipboardList />, label: "Đơn hàng" },
        { path: "/banners", icon: <FaElementor />, label: "Banner" },
      ],
    },
  ];

  // Hàm kiểm tra xem link có đang active không
  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 sticky top-0 shadow-sm">
      {/* Phần Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-xl font-bold text-purple-600 uppercase">
          GTBOOKS
        </span>
      </div>

      {/* Phần danh sách Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group, index) => (
          <div key={index} className="mb-6">
            {/* Tiêu đề nhóm */}
            <span className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              {group.title}
            </span>

            {/* Các mục trong nhóm */}
            <ul>
              {group.items.map((item) => (
                <Link to={item.path} key={item.label}>
                  <li
                    className={`relative px-6 py-3 flex items-center text-sm font-medium transition-all duration-200 cursor-pointer
                      ${
                        isActive(item.path)
                          ? "text-purple-600 bg-purple-50 border-r-4 border-purple-600" // Style khi đang chọn
                          : "text-gray-600 hover:bg-gray-50 hover:text-purple-500" // Style bình thường
                      }`}
                  >
                    <span className="text-lg mr-4">{item.icon}</span>
                    {item.label}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Phần Đăng xuất */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors duration-200">
          <FaSignOutAlt className="mr-3 text-lg" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </div>
      </div>
    </div>
  );
};

export default Menu;
