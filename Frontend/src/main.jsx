import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 1. Import Provider của Redux
import { Provider } from "react-redux";

// 2. Import PersistGate để đồng bộ dữ liệu từ LocalStorage
import { PersistGate } from "redux-persist/integration/react";

// 3. Import store và persistor bạn đã tạo
import { store, persistor } from "./redux/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Bọc App bằng Provider để cả ứng dụng dùng được Redux */}
    <Provider store={store}>
      {/* PersistGate giữ ứng dụng đợi load xong dữ liệu cũ rồi mới hiển thị */}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
