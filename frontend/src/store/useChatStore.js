import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance";
import useAuthStore from "./useAuthStore";

const useChatStore = create((set, get) => ({
  messages: [],
  page: 1,
  hasMoreMessages: true,
  isLoadingMore: false,
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

  getMessages: async (selectedUserId, page = 1, limit = 30) => {
    // Load initial page (page=1) or replace messages
    if (page === 1)
      set({
        isMessagesLoading: true,
        messages: [],
        page: 1,
        hasMoreMessages: true,
      });
    else set({ isLoadingMore: true });
    try {
      const { data } = await axiosInstance.get(
        `/messages/${selectedUserId}?page=${page}&limit=${limit}`,
      );
      if (Array.isArray(data)) {
        if (page === 1) {
          set({
            messages: data,
            page: 1,
            hasMoreMessages: data.length === limit,
          });
          // Load any unsent messages for this chat from localStorage
          try {
            const unsentRaw = localStorage.getItem("unsentMessages");
            const unsent = unsentRaw ? JSON.parse(unsentRaw) : {};
            const list = Array.isArray(unsent[selectedUserId]) ? unsent[selectedUserId] : [];
            if (list.length) {
              set((state) => ({
                messages: [...state.messages, ...list.filter((m) => !state.messages.some((s) => s._id === m._id))],
              }));
            }
          } catch (err) {
            // ignore storage errors
          }
        } else {
          // prepend older messages
          set((state) => ({
            messages: [...data, ...state.messages],
            page,
            hasMoreMessages: data.length === limit,
          }));
        }
      }
    } catch (error) {
      console.log("Error in getMessages", error);
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false, isLoadingMore: false });
    }
  },
  loadMoreMessages: async (selectedUserId, limit = 30) => {
    const { page, hasMoreMessages, isLoadingMore } = get();
    if (!hasMoreMessages || isLoadingMore) return;
    const nextPage = page + 1;
    await get().getMessages(selectedUserId, nextPage, limit);
  },
  deleteMessages: async (selectedUserId) => {
    set({ isMessagesLoading: true, messages: [] });
    try {
      await axiosInstance.delete(`/messages/${selectedUserId}`);
      set({ messages: [] });
      toast.success("Messages deleted successfully");
    } catch (error) {
      console.log("Error in deleteMessages", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData, tempId = null) => {
    const { selectedUser, messages, replyMessage } = get();
    if (!selectedUser) {
      toast.error("No chat selected");
      return;
    }

    // Create optimistic message if not retrying
    const isRetry = !!tempId;
    const localId =
      tempId || `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    const optimisticMessage = {
      _id: localId,
      senderId: useAuthStore.getState().authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text || "",
      image: messageData.image || null,
      repliedMessage: replyMessage || null,
      createdAt: now,
      status: "sending", // custom client field: sending | sent | failed
    };

    if (!isRetry) {
      set({
        replyMessage: null,
        isImageUploading: !!messageData.image,
        messages: [...messages, optimisticMessage],
      });
    } else {
      // mark existing temp message as sending
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === localId ? { ...m, status: "sending" } : m,
        ),
      }));
      set({ isImageUploading: !!messageData.image });
    }

    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { ...messageData, repliedMessage: replyMessage?._id },
      );

      // Replace optimistic message with server message, and ensure no duplicates.
      set((state) => {
        // Map optimistic local message to server message
        const replaced = state.messages.map((m) => (m._id === localId ? { ...data, status: "sent" } : m));
        // Deduplicate by _id, preserve order
        const seen = new Map();
        const unique = [];
        for (const msg of replaced) {
          if (!seen.has(msg._id)) {
            seen.set(msg._id, true);
            unique.push(msg);
          }
        }
        return { messages: unique, isImageUploading: false };
      });
      // On success, remove any persisted failed message for this local id
      try {
        const storeRaw = localStorage.getItem("unsentMessages");
        if (storeRaw) {
          const storeObj = JSON.parse(storeRaw);
          const arr = Array.isArray(storeObj[selectedUser._id]) ? storeObj[selectedUser._id] : [];
          const filtered = arr.filter((m) => m._id !== localId);
          storeObj[selectedUser._id] = filtered;
          localStorage.setItem("unsentMessages", JSON.stringify(storeObj));
        }
      } catch (err) {
        // ignore localStorage errors
      }
    } catch (error) {
      set({ isImageUploading: false });
      // Mark message as failed so UI can let user retry
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === localId
            ? {
                ...m,
                status: "failed",
                error: error?.response?.data?.message || error.message,
              }
            : m,
        ),
      }));
      // persist failed message to localStorage keyed by receiver id
      try {
        const storeRaw = localStorage.getItem("unsentMessages");
        const storeObj = storeRaw ? JSON.parse(storeRaw) : {};
        const arr = Array.isArray(storeObj[selectedUser._id]) ? storeObj[selectedUser._id] : [];
        // Take the message from state (it should exist) to persist
        const failedMsg = get().messages.find((m) => m._id === localId);
        if (failedMsg && !arr.some((m) => m._id === failedMsg._id)) {
          arr.push(failedMsg);
          storeObj[selectedUser._id] = arr;
          localStorage.setItem("unsentMessages", JSON.stringify(storeObj));
        }
      } catch (err) {
        // ignore storage errors
      }
      if (messageData.image) {
        toast.error(
          "Image upload failed: " +
            (error?.response?.data?.message || error.message),
        );
      } else {
        toast.error(
          "Message send failed: " +
            (error?.response?.data?.message || error.message),
        );
      }
    }
  },
  resendMessage: async (tempId) => {
    const { messages } = get();
    const msg = messages.find((m) => m._id === tempId);
    if (!msg) return;
    // remove client-only fields before resending
    const payload = { text: msg.text, image: msg.image };
    await get().sendMessage(payload, tempId);
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

    socket.on("userLastSeenUpdated", () => {
      get().getUsers();
    });

    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (!isMessageSentFromSelectedUser) return;

      // Avoid duplicate messages: check if message id already exists
      set((state) => {
        if (state.messages.some((m) => m._id === newMessage._id)) {
          return {};
        }
        return { messages: [...state.messages, newMessage] };
      });

      // Ensure the message's repliedMessage is populated if necessary
      if (
        newMessage.repliedMessage &&
        typeof newMessage.repliedMessage === "string"
      ) {
        try {
          const { data } = await axiosInstance.get(
            `/messages/${newMessage.repliedMessage}`,
          );
          // update the message in state with populated repliedMessage
          set((state) => ({
            messages: state.messages.map((m) =>
              m._id === newMessage._id ? { ...m, repliedMessage: data } : m,
            ),
          }));
        } catch (err) {
          // ignore population errors
          console.log("Failed to populate repliedMessage", err?.message || err);
        }
      }
    });

    socket.on("chatDeleted", ({ userId }) => {
      if (selectedUser && selectedUser._id === userId) {
        get().getMessages(selectedUser._id);
      }
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
