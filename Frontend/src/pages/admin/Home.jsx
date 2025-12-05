import { LineChart } from "@mui/x-charts/LineChart";
import {
  FaBook,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaMoneyBillWave,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";

const Home = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    recentTransactions: [],
    monthlySalesData: [0, 0, 0, 0, 0, 0], // Sẽ được cập nhật từ API
    monthlyLabels: ["Th.6", "Th.7", "Th.8", "Th.9", "Th.10", "Th.11"],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm định dạng tiền tệ
  const formatCurrency = (total) => {
    return total ? total.toLocaleString("vi-VN") + " VND" : "0 VND";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- 1. Fetch Tổng Sản phẩm, Người dùng ---
        const [productsRes, usersRes] = await Promise.all([
          userRequest.get("/products"),
          userRequest.get("/users"),
        ]);

        const totalProducts = productsRes.data.length;
        const totalUsers = usersRes.data.length;

        // --- 2. Fetch Đơn hàng (Cần để tính Tổng tiền và Giao dịch gần đây) ---
        const ordersRes = await userRequest.get("/orders");
        const allOrders = ordersRes.data;
        const totalOrders = allOrders.length;

        // --- 3. Tính toán Doanh thu ---
        const totalRevenue = allOrders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );

        // --- 4. Lấy 4 Giao dịch gần đây nhất ---
        const recentTransactions = allOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
          .map((order) => ({
            customer: order.name || "Khách ẩn danh",
            total: order.total || 0,
            status:
              order.status === 2
                ? "Đã giao"
                : order.status === 1
                ? "Đang xử lý"
                : "Chờ xác nhận",
            color:
              order.status === 2
                ? "green"
                : order.status === 1
                ? "blue"
                : "yellow",
          }));

        // --- 5. Giả định dữ liệu biểu đồ (Thực tế cần API riêng cho Sales Analytics) ---
        // Sử dụng dữ liệu giả định tạm thời hoặc xử lý dữ liệu order để tính toán monthlySalesData nếu cần
        const mockMonthlySalesData = [100, 250, 400, 550, 480, 650];

        setStats({
          products: totalProducts,
          orders: totalOrders,
          users: totalUsers,
          revenue: totalRevenue,
          recentTransactions: recentTransactions,
          monthlySalesData: mockMonthlySalesData,
          monthlyLabels: ["Th.6", "Th.7", "Th.8", "Th.9", "Th.10", "Th.11"],
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu thống kê. Vui lòng kiểm tra server.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Định nghĩa Card thống kê
  const statCards = [
    {
      title: "Tổng Sản phẩm",
      value: stats.products,
      icon: FaBook,
      color: "blue",
      unit: "cuốn",
    },
    {
      title: "Tổng Đơn hàng",
      value: stats.orders,
      icon: FaShoppingCart,
      color: "purple",
      unit: "đơn",
    },
    {
      title: "Tổng Khách hàng",
      value: stats.users,
      icon: FaUsers,
      color: "indigo",
      unit: "người",
    },
  ];

  // Định nghĩa Card tài chính (Giả định Trend và Loss cố định)
  const financialCards = [
    {
      title: "Tổng Doanh thu",
      value: stats.revenue,
      icon: FaMoneyBillWave,
      color: "green",
      trend: 5.2,
      isRevenue: true,
    },
    {
      title: "Tổng Thiệt hại",
      value: 1200000,
      icon: FaArrowDown,
      color: "red",
      trend: -1.5,
      isRevenue: false,
    },
  ];

  if (loading)
    return (
      <div className="p-8 text-center text-xl text-purple-600">
        Đang tải bảng điều khiển...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500 bg-red-100 border border-red-300 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="flex-1 p-8 bg-gray-50 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 DASHBOARD</h1>

      {/* 1. ROW: CÁC THẺ THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 shadow-xl rounded-xl flex items-center justify-between transition duration-300 hover:ring-2 hover:ring-purple-400"
          >
            <div
              className={`p-4 rounded-full bg-${card.color}-100 text-${card.color}-600`}
            >
              <card.icon className="text-3xl" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500">
                {card.title}
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {card.value}{" "}
                <span className="text-base text-gray-600 font-normal">
                  {card.unit}
                </span>
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* 2. ROW: BIỂU ĐỒ DOANH THU & TÀI CHÍNH NHANH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Biểu đồ */}
        <div className="lg:col-span-2 bg-white p-6 shadow-xl rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center text-purple-600">
            <FaChartBar className="mr-2" /> Biểu đồ Doanh thu (Triệu VND)
          </h3>
          <div className="h-[300px] w-full">
            <LineChart
              xAxis={[{ data: stats.monthlyLabels, scaleType: "band" }]}
              series={[
                {
                  data: stats.monthlySalesData,
                  label: "Doanh thu",
                  color: "#8b5cf6", // Purple color
                },
              ]}
              height={300}
              margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
              grid={{ vertical: false, horizontal: true }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        </div>

        {/* Tài chính Nhanh (Financial Summary) */}
        <div className="flex flex-col space-y-6">
          {financialCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white p-6 shadow-xl rounded-xl border border-${card.color}-200`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-full bg-${card.color}-100 text-${card.color}-600`}
                >
                  <card.icon className="text-xl" />
                </div>
                <span
                  className={`text-sm font-semibold flex items-center text-${card.color}-600`}
                >
                  {card.isRevenue ? "Tăng" : "Giảm"} {Math.abs(card.trend)}%
                  {card.isRevenue ? (
                    <FaArrowUp className="ml-1 text-xs" />
                  ) : (
                    <FaArrowDown className="ml-1 text-xs" />
                  )}
                </span>
              </div>
              <p className="text-md font-semibold text-gray-500 mt-4">
                {card.title}
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                {formatCurrency(card.value)}
              </h2>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ROW: GIAO DỊCH GẦN ĐÂY */}
      <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-100">
        <h3 className="text-xl font-bold mb-4">
          Giao dịch Gần đây nhất (4 giao dịch)
        </h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-purple-50">
              <th className="py-3 px-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider rounded-tl-lg">
                Khách hàng
              </th>
              <th className="py-3 px-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="py-3 px-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider rounded-tr-lg">
                Trạng thái
              </th>
            </tr>
          </thead>

          <tbody>
            {stats.recentTransactions.map((tx, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {tx.customer}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                  {formatCurrency(tx.total)}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              tx.color === "green"
                                ? "bg-green-100 text-green-800"
                                : tx.color === "red"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
