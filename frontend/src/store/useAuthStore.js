import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import { data } from "react-router-dom";

const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggining: false,
  isProfileUpdating: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const { data } = axiosInstance.post("/auth/check");
      set({ authUser: data });
    } catch (error) {
      console.log("Error in checkAuth", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
