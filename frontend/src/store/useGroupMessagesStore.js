import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./userAuthStore";

export const useGroupMessagesStore = create((set, get) => ({
  groupMessages: [],
  activeGroup: null,
  isGroupMessagesLoading: false,

  setActiveGroup: (group) => set({ activeGroup: group }),

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/group-messages/${groupId}`);
      set({ groupMessages: res.data.data, isGroupMessagesLoading: false });
    } catch (error) {
      set({ isGroupMessagesLoading: false });
      toast.error(
        error.response?.data?.message || "Error fetching group messages"
      );
    }
  },

  // OLD SINGLE IMAGE IMPLEMENTATION - COMMENTED OUT
  // sendGroupMessage: async (messageData) => {
  //   const { activeGroup, groupMessages } = get();
  //   try {
  //     const formData = new FormData();
  //     if (messageData.text) {
  //       formData.append("text", messageData.text);
  //     }
  //     if (messageData.image) {
  //       formData.append("image", messageData.image);
  //     }
  //     const res = await axiosInstance.post(
  //       `/group-messages/${activeGroup._id}`,
  //       formData
  //     );
  //     const newGroupMessage = res.data.data;
  //     const updatedMessages = [...groupMessages, newGroupMessage];
  //     set({ groupMessages: updatedMessages });
  //   } catch (error) {
  //     toast.error(
  //       error.response?.data?.message || "Error sending group message"
  //     );
  //   }
  // },

  // NEW MULTIPLE IMAGE IMPLEMENTATION
  // Updated to support multiple images like ChatContainer
  // Changed from single 'image' to 'images' array for consistency
  sendGroupMessage: async (messageData) => {
    const { activeGroup, groupMessages } = get();
    try {
      const formData = new FormData();

      if (messageData.text) {
        formData.append("text", messageData.text);
      }

      // Enhanced: Handle multiple images instead of single image
      // This allows group chat users to send multiple images at once
      if (messageData.images && messageData.images.length > 0) {
        messageData.images.forEach((image) => {
          formData.append("image", image);
        });
      }

      console.log("Sending message to:", `/group-messages/${activeGroup._id}`);
      console.log("MessageData:", {
        text: messageData.text,
        imageCount: messageData.images?.length || 0,
      });

      const res = await axiosInstance.post(
        `/group-messages/${activeGroup._id}`,
        formData
      );

      const newGroupMessage = res.data.data;
      console.log("response from server:", res.data);
      console.log("Received new group message:", newGroupMessage);

      const updatedMessages = [...groupMessages, newGroupMessage];
      console.log("messages after send:", updatedMessages.map((m) => m._id));

      set({ groupMessages: updatedMessages });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error sending group message"
      );
    }
  },

  // NEW: Real-time subscription functions for group messages
  // These were missing in the old implementation
  // Allows group members to see messages in real-time without page refresh
  subscribeToGroupMessages: () => {
    const { activeGroup } = get();
    if (!activeGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Listen for new group messages
    // When someone in the group sends a message, all members receive it instantly
    socket.on("newGroupMessage", (newMessage) => {
      const isMessageForCurrentGroup = newMessage.groupId === activeGroup._id;
      if (!isMessageForCurrentGroup) return;

      // Add the new message to the current group messages
      set({
        groupMessages: [...get().groupMessages, newMessage],
      });
    });
  },

  // Clean up socket listeners when component unmounts or group changes
  // Prevents memory leaks and ensures we don't receive messages for old groups
  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newGroupMessage");
  },
}));
