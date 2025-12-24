import Banner from "../components/Banner";
import Category from "../components/Category";
import FlashSale from "../components/FlashSale";
import BestSeller from "../components/BestSeller";
import TopRated from "../components/TopRated";
import RandomProducts from "../components/RandomProducts";

const Home = () => {
  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      {/* Wrapper giới hạn chiều rộng nội dung để căn giữa đẹp mắt */}
      <div className="max-w-7xl mx-auto px-4 space-y-6 pt-6">
        {/* 1. Banner Slider */}
        <Banner />

        {/* 2. Flash Sale */}
        <FlashSale />

        {/* 3. Danh mục thể loại */}
        <Category />

        {/* 4. Top Sách Bán Chạy */}
        <BestSeller />

        {/* 5. Sách Đánh Giá Cao (MỚI) */}
        <TopRated />

        {/* 6. Gợi ý ngẫu nhiên (MỚI) */}
        <RandomProducts />
      </div>
    </div>
  );
};

export default Home;
