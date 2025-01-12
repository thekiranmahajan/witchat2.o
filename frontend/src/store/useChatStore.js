import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance";
import useAuthStore from "./useAuthStore";

const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  replyMessage: null,
  isImageUploading: false,

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
    set({ isMessagesLoading: true, messages: [] });
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: data });
    } catch (error) {
      console.log("Error in getMessages", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyMessage } = get();
    try {
      set({
        replyMessage: null,
        isImageUploading: !!messageData.image,
      });

      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, repliedMessage: replyMessage?._id },
      );
      set({
        messages: [...messages, data],
        isImageUploading: false,
      });
    } catch (error) {
      set({ isImageUploading: false });
      if (messageData.image) {
        toast.error("Image upload failed: " + error.response.data.message);
      } else {
        toast.error("Message send failed: " + error.response.data.message);
      }
    }
  },

  setReplyMessage: (message) => {
    set({ replyMessage: message });
  },

  clearReplyMessage: () => {
    set({ replyMessage: null });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("user-started-typing", ({ typingUserId }) => {
      if (selectedUser && typingUserId === selectedUser._id) {
        set((state) => ({
          users: state.users.map((user) =>
            user._id === typingUserId ? { ...user, isTyping: true } : user,
          ),
        }));
      }
    });
    socket.on("user-stopped-typing", ({ typingUserId }) => {
      if (selectedUser && typingUserId === selectedUser._id) {
        set((state) => ({
          users: state.users.map((user) =>
            user._id === typingUserId ? { ...user, isTyping: false } : user,
          ),
        }));
      }
    });

    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (!isMessageSentFromSelectedUser) return;

      // Ensure the message is properly populated
      if (
        newMessage.repliedMessage &&
        typeof newMessage.repliedMessage === "string"
      ) {
        const { data } = await axiosInstance.get(
          `/messages/${newMessage.repliedMessage}`,
        );
        newMessage.repliedMessage = data;
      }

      set((state) => ({ messages: [...state.messages, newMessage] }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (userId) => {
    set((state) => {
      const selectedUser = state.users.find((user) => user._id === userId);
      return { selectedUser };
    });
  },
}));
export default useChatStore;
