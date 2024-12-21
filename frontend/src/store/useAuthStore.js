import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import toast from "react-hot-toast";

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
      console.log("Error in checkAuth fn", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });

    try {
      const { data } = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: data });
      toast.success("Account created successfully");
    } catch (error) {
      console.log("Error in signup fn", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
}));

export default useAuthStore;
