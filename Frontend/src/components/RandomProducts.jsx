import { useEffect, useState } from "react";
import { FaLightbulb } from "react-icons/fa";
import { userRequest } from "../requestMethods";
import ProductCard from "./ProductCard";

const RandomProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        // Gọi API Random
        const res = await userRequest.get("/products?random=true");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRandom();
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center mb-6 mt-10">
        <div className="h-[2px] w-12 bg-purple-200"></div>
        <h2 className="text-2xl font-extrabold text-gray-800 mx-4 flex items-center uppercase text-purple-700">
          <FaLightbulb className="mr-2 text-yellow-400" />
          Gợi Ý Hôm Nay
        </h2>
        <div className="h-[2px] w-12 bg-purple-200"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </div>
  );
};

export default RandomProducts;
