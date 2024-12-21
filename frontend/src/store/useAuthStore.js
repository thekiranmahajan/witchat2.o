import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";

const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggining: false,
  isProfileUpdating: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.get("/auth/check");

      set({ authUser: data });
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
