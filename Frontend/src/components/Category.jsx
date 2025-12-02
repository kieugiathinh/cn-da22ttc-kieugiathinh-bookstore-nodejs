import { useEffect, useState } from "react";
import { userRequest } from "../requestMethods";
import { FaBookOpen, FaListAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Category = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCats = async () => {
      try {
        const res = await userRequest.get("/categories");
        setCategories(res.data);
      } catch (err) {}
    };
    getCats();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center mb-4">
        <FaListAlt className="text-purple-600 text-xl mr-2" />
        <h2 className="text-xl font-bold text-gray-800 uppercase">
          Thể Loại Sách
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((cat) => (
          <Link to={`/products/${cat._id}`} key={cat._id}>
            <div className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1">
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-2 group-hover:bg-purple-100 border border-purple-100 transition-colors">
                <FaBookOpen className="text-2xl text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-purple-600 transition-colors line-clamp-2">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Category;
