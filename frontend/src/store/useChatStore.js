import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance";

const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await axiosInstance.get("/messages/users");
      set({ users: data });
    } catch (error) {
      console.log("Error in getUsers", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: data });
      console.log(data + " ...................");
    } catch (error) {
      console.log("Error in getMessages", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  setSelectedUser: (userId) => {
    set((state) => {
      const selectedUser = state.users.find((user) => user._id === userId);
      return { selectedUser };
    });
  },
}));
export default useChatStore;
