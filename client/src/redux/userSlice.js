import { createSlice } from "@reduxjs/toolkit";
import { users } from "../utills/data";

// Function to safely parse JSON from localStorage
const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null; // or handle error as needed
  }
};

// Initial state
const initialState = {
  user: parseJSON(window?.localStorage.getItem("userInfo")) ?? null,
};

// Create slice
const userSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem("userInfo");
    },
  },
});

// Export actions
export const { login, logout } = userSlice.actions;

// Export reducer
export default userSlice.reducer;

// Action creators
export function Login(user) {
  return (dispatch) => {
    dispatch(login(user));
  };
}

export function Logout() {
  return (dispatch) => {
    dispatch(logout());
  };
}
