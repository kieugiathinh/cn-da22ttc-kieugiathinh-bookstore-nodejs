import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  FaMoneyBillWave,
  FaShoppingBag,
  FaUserFriends,
  FaCube,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaSync,
  FaExclamationCircle,
  FaCrown,
} from "react-icons/fa";

const Dashboard = () => {
  // --- STATE ---
  const [timeRange, setTimeRange] = useState("month");
  const [kpi, setKpi] = useState(null);

  // Charts Data
  const [revenueChart, setRevenueChart] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // Tables Data
  const [prodStats, setProdStats] = useState({ lowStock: [], topSelling: [] });
  const [customers, setCustomers] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [isCompare, setIsCompare] = useState(false);
  const [year1, setYear1] = useState(new Date().getFullYear());
  const [year2, setYear2] = useState(new Date().getFullYear() - 1);

  // --- API CALLS ---

  // 1. Load KPI khi đổi filter time
  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const res = await userRequest.get(`/stats/summary?type=${timeRange}`);
        setKpi(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKPI();
  }, [timeRange]);

  // 2. Load Dữ liệu Charts & Tables (1 lần)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRev, resCat, resStatus, resProd, resCus, resOrders] =
          await Promise.all([
            userRequest.get("/stats/revenue-chart"),
            userRequest.get("/stats/categories"),
            userRequest.get("/stats/order-status"),
            userRequest.get("/stats/products-analytics"),
            userRequest.get("/stats/top-customers"),
            userRequest.get("/stats/latest-orders"),
          ]);

        setRevenueChart(resRev.data);

        // Fix Category Data for PieChart
        setCategoryData(
          resCat.data.map((i, idx) => ({
            id: idx,
            value: i.value,
            label: i.name,
          }))
        );

        // Fix Status Data
        const statusMap = ["Chờ xác nhận", "Đang giao", "Hoàn thành", "Đã hủy"];
        const colorMap = ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"];
        setStatusData(
          resStatus.data.map((i, idx) => ({
            id: idx,
            value: i.value,
            label: statusMap[i._id] || "Khác",
            color: colorMap[i._id],
          }))
        );

        setProdStats(resProd.data);
        setCustomers(resCus.data);
        setLatestOrders(resOrders.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Load Compare Data khi bật toggle
  useEffect(() => {
    if (!isCompare) return;
    const fetchCompare = async () => {
      try {
        const res = await userRequest.get(
          `/stats/revenue-comparison?year1=${year1}&year2=${year2}`
        );
        setCompareData({
          y1: res.data.year1.map((v) => v / 1000000), // Triệu VNĐ
          y2: res.data.year2.map((v) => v / 1000000),
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompare();
  }, [isCompare, year1, year2]);

  // Helper xử lý ảnh lỗi
  const handleImgError = (e) => {
    e.target.src = "https://via.placeholder.com/150?text=No+Image";
  };

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center text-gray-500">
        <FaSync className="animate-spin mr-2" /> Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* HEADER & GLOBAL FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Tổng quan tình hình kinh doanh
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["day", "week", "month", "year"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                timeRange === t
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "day"
                ? "Hôm nay"
                : t === "week"
                ? "Tuần này"
                : t === "month"
                ? "Tháng này"
                : "Năm nay"}
            </button>
          ))}
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Doanh Thu"
          value={`${kpi?.revenue?.toLocaleString()} ₫`}
          icon={<FaMoneyBillWave />}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <KPICard
          title="Đơn Hàng"
          value={kpi?.orders}
          icon={<FaShoppingBag />}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KPICard
          title="Giá Trị TB"
          value={`${kpi?.avgOrder?.toLocaleString()} ₫`}
          icon={<FaFilter />}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KPICard
          title="Sản Phẩm"
          value={kpi?.products}
          icon={<FaCube />}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* 2. MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* REVENUE CHART (Dynamic Compare) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Phân Tích Doanh Thu
              </h3>
              <p className="text-xs text-slate-400">
                Theo dõi xu hướng dòng tiền
              </p>
            </div>

            {/* Toggle Compare */}
            <div className="flex flex-col items-end gap-2">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsCompare(!isCompare)}
              >
                <span
                  className={`text-xs font-bold ${
                    isCompare ? "text-indigo-600" : "text-slate-400"
                  }`}
                >
                  So sánh
                </span>
                <div
                  className={`w-10 h-5 rounded-full p-1 transition-all ${
                    isCompare ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full shadow-sm transition-all ${
                      isCompare ? "translate-x-5" : ""
                    }`}
                  ></div>
                </div>
              </div>

              {/* Selectors Năm (Chỉ hiện khi Compare ON) */}
              {isCompare && (
                <div className="flex gap-2 animate-fadeIn">
                  <select
                    value={year1}
                    onChange={(e) => setYear1(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded px-2 py-1 font-bold outline-none"
                  >
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-bold text-slate-400">-</span>
                  <select
                    value={year2}
                    onChange={(e) => setYear2(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded px-2 py-1 font-bold outline-none"
                  >
                    {[2021, 2022, 2023, 2024].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isCompare && compareData ? (
              <BarChart
                series={[
                  {
                    data: compareData.y1,
                    label: `Năm ${year1}`,
                    color: "#6366f1",
                  },
                  {
                    data: compareData.y2,
                    label: `Năm ${year2}`,
                    color: "#cbd5e1",
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "band",
                    data: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
                  },
                ]}
                margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
                borderRadius={4}
              />
            ) : (
              <LineChart
                series={[
                  {
                    data: revenueChart.map((i) => i.revenue / 1000000),
                    label: "Doanh thu (Triệu)",
                    color: "#6366f1",
                    area: true,
                    showMark: false,
                  },
                  {
                    data: revenueChart.map((i) => i.orders),
                    label: "Đơn hàng",
                    color: "#f59e0b",
                    yAxisKey: "orders",
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "point",
                    data: revenueChart.map((i) => i.month),
                  },
                ]}
                yAxis={[{ id: "default" }, { id: "orders", position: "right" }]}
                rightAxis="orders"
                margin={{ top: 20, bottom: 30, left: 40, right: 40 }}
              />
            )}
          </div>
        </div>

        {/* PIE CHARTS STACK */}
        <div className="flex flex-col gap-6">
          {/* Category Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h3 className="font-bold text-sm text-slate-800 mb-2">
              Tỷ Trọng Danh Mục
            </h3>
            <div className="h-[160px] flex justify-center">
              {categoryData.length > 0 ? (
                <PieChart
                  series={[
                    {
                      data: categoryData,
                      innerRadius: 0,
                      outerRadius: 75,
                      paddingAngle: 0,
                      cornerRadius: 0,
                    },
                  ]}
                  slotProps={{ legend: { hidden: true } }}
                />
              ) : (
                <span className="text-xs text-gray-400 self-center">
                  Chưa có dữ liệu
                </span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {categoryData.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between text-xs border-b border-dashed border-slate-100 py-1"
                >
                  <span className="text-slate-600 truncate w-32">
                    {c.label}
                  </span>
                  <span className="font-bold">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h3 className="font-bold text-sm text-slate-800 mb-2">
              Trạng Thái Đơn
            </h3>
            <div className="h-[160px] flex justify-center">
              {statusData.length > 0 ? (
                <PieChart
                  series={[
                    {
                      data: statusData,
                      innerRadius: 40,
                      outerRadius: 75,
                      paddingAngle: 2,
                      cornerRadius: 4,
                    },
                  ]}
                  slotProps={{ legend: { hidden: true } }}
                />
              ) : (
                <span className="text-xs text-gray-400 self-center">
                  Chưa có dữ liệu
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusData.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-[10px] text-slate-500"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: s.color }}
                  ></span>
                  {s.label} ({s.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <FaCrown className="text-yellow-500" /> Sản Phẩm Bán Chạy
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Sản phẩm</th>
                  <th className="px-3 py-2 text-right">Đã bán</th>
                  <th className="px-3 py-2 text-right rounded-r-lg">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody>
                {prodStats.topSelling.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 hover:bg-slate-50 transition"
                  >
                    <td className="px-3 py-3 flex items-center gap-3">
                      <span
                        className={`text-xs font-bold w-4 ${
                          i < 3 ? "text-indigo-600" : "text-gray-400"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <img
                        src={p.img}
                        onError={handleImgError}
                        className="w-10 h-10 rounded object-cover border border-slate-100"
                        alt=""
                      />
                      <span
                        className="font-medium text-slate-700 line-clamp-1 w-40"
                        title={p.title}
                      >
                        {p.title}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-indigo-600">
                      {p.sold}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-500">
                      {(p.price * p.sold).toLocaleString()} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Customers */}
        <div className="flex flex-col gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FaExclamationCircle className="text-red-500" /> Cảnh Báo Tồn
                Kho
              </h3>
              <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">
                Critical
              </span>
            </div>
            <div className="space-y-3">
              {prodStats.lowStock.length > 0 ? (
                prodStats.lowStock.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.img}
                        onError={handleImgError}
                        className="w-10 h-10 rounded object-cover"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-700 line-clamp-1 w-40">
                          {p.title}
                        </p>
                        <p className="text-xs text-red-500 font-medium">
                          Còn lại: {p.countInStock}
                        </p>
                      </div>
                    </div>
                    <button className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50">
                      Nhập
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-green-600">Kho hàng ổn định.</p>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <FaUserFriends className="text-blue-500" /> Khách Hàng VIP
            </h3>
            <div className="space-y-3">
              {customers.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2 hover:bg-slate-50 rounded transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {c.name ? c.name.charAt(0) : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {c.name || "Khách lạ"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {c.count} đơn hàng
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    +{c.total.toLocaleString()} ₫
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Card nhỏ
const KPICard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-800">{value || 0}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg} ${color} text-lg`}>{icon}</div>
  </div>
);

export default Dashboard;
