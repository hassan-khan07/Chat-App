import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./userAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users/sidebar");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  // sendMessage: async (messageData) => {
  //   const { selectedUser, messages } = get();
  //   try {
  //     const formData = new FormData();

  //     if (messageData.text) {
  //       formData.append("text", messageData.text);
  //     }

  //     if (messageData.image) {
  //       formData.append("image", messageData.image);
  //     }

  //     const res = await axiosInstance.post(
  //       `/messages/send/${selectedUser._id}`,
  //       formData
  //     );

  //     set({ messages: [...messages, res.data] });
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Error sending message");
  //   }
  // },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const formData = new FormData();

      if (messageData.text) {
        formData.append("text", messageData.text);
      }

      // Handle multiple images
      if (messageData.images && messageData.images.length > 0) {
        messageData.images.forEach((image) => {
          formData.append("image", image);
        });
      }

      console.log("Sending message to:", `/messages/send/${selectedUser._id}`);
      console.log("MessageData:", {
        text: messageData.text,
        imageCount: messageData.images?.length || 0,
      });

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData
      );

      // ✅ The backend response wraps the message inside `data`
      const newMessage = res.data.data;

      console.log("Response from backend:", res.data);
      console.log("Saved message from backend:", newMessage);

      const newMessages = [...messages, newMessage];
      console.log(
        "Messages after send:",
        newMessages.map((m) => m?._id)
      );

      set({ messages: newMessages });
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },

  // subscribeToMessages: () => {
  //   const { selectedUser } = get();
  //   if (!selectedUser) return;

  //   const socket = useAuthStore.getState().socket;

  //   socket.on("newMessage", (newMessage) => {
  //     const isMessageSentFromSelectedUser =
  //       newMessage.senderId === selectedUser._id;
  //     if (!isMessageSentFromSelectedUser) return;

  //     set({
  //       messages: [...get().messages, newMessage],
  //     });
  //   });
  // },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // 🛑 Remove any existing listener before adding a new one
    // (prevents duplicate "newMessage" events when switching chats)
    socket.off("newMessage");

    // ✅ Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const { messages } = get();

      // 📝 Why this check?
      // We only want messages for the currently open chat.
      // - If message is sent BY the selected user → show it
      // - If message is sent TO the selected user → also show it
      const isFromSelectedUser = newMessage.senderId === selectedUser._id;
      const isToSelectedUser = newMessage.receiverId === selectedUser._id;

      if (isFromSelectedUser || isToSelectedUser) {
        set({ messages: [...messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    // 📝 Why this change?
    // Instead of removing *all* listeners blindly,
    // we remove only "newMessage" to keep socket clean.
    socket.off("newMessage");
  },

  // unsubscribeFromMessages: () => {
  //   const socket = useAuthStore.getState().socket;
  //   socket.off("newMessage");
  // },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
