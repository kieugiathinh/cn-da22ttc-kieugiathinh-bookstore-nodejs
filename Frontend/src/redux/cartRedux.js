import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",

  initialState: {
    products: [], // Mảng chứa các sản phẩm
    quantity: 0, // Tổng số lượng sản phẩm trong giỏ (để hiện lên Badge icon)
    total: 0, // Tổng tiền
  },

  reducers: {
    addProduct: (state, action) => {
      const newItem = action.payload;

      // 1. Kiểm tra xem sản phẩm này đã có trong giỏ chưa
      const existingItem = state.products.find(
        (item) => item._id === newItem._id
      );

      if (existingItem) {
        // Nếu có rồi -> Chỉ tăng số lượng của món đó lên
        existingItem.quantity += newItem.quantity;
      } else {
        // Nếu chưa có -> Thêm món mới vào mảng
        state.products.push(newItem);
      }

      // 2. Cập nhật tổng số lượng hiển thị trên Icon (Badge)
      // Ví dụ: Mua 2 cuốn A và 1 cuốn B -> quantity = 3
      state.quantity += newItem.quantity;

      // 3. Cập nhật tổng tiền
      state.total += newItem.price * newItem.quantity;
    },

    removeProduct: (state, action) => {
      // action.payload gửi lên là ID của sản phẩm cần xóa (ví dụ: dispatch(removeProduct("id_123")))
      const idToRemove = action.payload;

      const index = state.products.findIndex((item) => item._id === idToRemove);

      if (index !== -1) {
        const itemToRemove = state.products[index];

        // Trừ đi số lượng của món đó khỏi tổng quantity chung
        state.quantity -= itemToRemove.quantity;

        // Trừ đi số tiền của món đó khỏi tổng total
        state.total -= itemToRemove.price * itemToRemove.quantity;

        // Xóa khỏi mảng
        state.products.splice(index, 1);
      }
    },

    updateQuantity: (state, action) => {
      // action.payload = { _id: "...", quantity: 5 } (Số lượng mới người dùng chọn)
      const { _id, quantity } = action.payload;
      const item = state.products.find((item) => item._id === _id);

      if (item) {
        // Tính chênh lệch để cập nhật Total và Quantity chung
        const quantityDifference = quantity - item.quantity;

        item.quantity = quantity;
        state.quantity += quantityDifference;
        state.total += item.price * quantityDifference;
      }
    },

    clearCart: (state) => {
      state.products = [];
      state.quantity = 0;
      state.total = 0;
    },
  },
});

export const { addProduct, removeProduct, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
