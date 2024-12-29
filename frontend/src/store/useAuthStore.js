import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { BACKEND_BASE_URL } from "../lib/constants";
import useChatStore from "./useChatStore";

const BASE_URL =
  import.meta.env.MODE === "development" ? BACKEND_BASE_URL : "/";

const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isProfileUpdating: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.get("/auth/check");

      set({ authUser: data });
      get().connectSocket();
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
      get().connectSocket();
    } catch (error) {
      console.log("Error in signup fn", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (formData) => {
    set({ isLoggingIn: true });

    try {
      const { data } = await axiosInstance.post("/auth/login", formData);
      set({ authUser: data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      console.log("Error in login fn", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout fn", error);
      toast.error("Error logging out");
    }
  },
  profileUpdate: async (profilePic) => {
    set({ isProfileUpdating: true });
    try {
      const { data } = await axiosInstance.put(
        "/auth/update-profile",
        profilePic,
      );
      set({ authUser: data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in profileUpdate fn", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isProfileUpdating: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    }).connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (usersIds) => {
      set({ onlineUsers: usersIds });
    });

    socket.on("newUserSignup", (newUser) => {
      const { users } = useChatStore.getState();
      const newUserAlreadyExists = users.some(
        (user) => user._id === newUser._id,
      );
      if (!newUserAlreadyExists) {
        useChatStore.setState({ users: [...users, newUser] });
      }
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));

export default useAuthStore;
