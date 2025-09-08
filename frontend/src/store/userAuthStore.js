import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  // import.meta.env.MODE === "development" ? "http://localhost:8000" : "/";
     import.meta.env.MODE === "development" ? "http://localhost:8000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  // isUpdatingAvatar: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/users/current-user");

      // Extract user data from response.data since checkAuth returns ApiResponse with user in data field
      set({ authUser: res.data.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/users/signup", data);
      // Extract user data from response.data since signup returns ApiResponse with user in data field
      set({ authUser: res.data.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/users/login", data);
      // Extract user data from response.data.user since login returns ApiResponse with user object in data field
      set({ authUser: res.data.data.user });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/users/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Update only name/email
  // updateUserDetails: async (data) => {
  //   set({ isUpdatingProfile: true });
  //   try {
  //     const res = await axiosInstance.patch("/users/update-account", {
  //       fullName: data.fullName,
  //       email: data.email,
  //     });

  //     set({ authUser: res.data.data });
  //     toast.success("Account details updated successfully!");
  //   } catch (error) {
  //     console.log("error in updateUserDetails:", error);
  //     toast.error(error.response?.data?.message || "Update failed");
  //   } finally {
  //     set({ isUpdatingProfile: false });
  //   }
  // },

  // updateProfile: async (data) => {
  //   set({ isUpdatingProfile: true });
  //   try {
  //     const formData = new FormData();
  //     formData.append("fullName", data.fullName);
  //     formData.append("email", data.email);

  //     if (data.avatar) {
  //       formData.append("avatar", data.avatar); // only append if user selected a new image
  //     }

  //     const res = await axiosInstance.patch("/users/update-profile", formData);

  //     // Extract user data from response.data since update-profile returns ApiResponse with user in data field
  //     set({ authUser: res.data.data });
  //     toast.success("Profile updated successfully");
  //   } catch (error) {
  //     console.log("error in update profile:", error);
  //     toast.error(error.response?.data?.message || "Update failed");
  //   } finally {
  //     set({ isUpdatingProfile: false });
  //   }
  // },

  // Update only avatar

  updateProfile: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axiosInstance.patch("/users/update-profile", formData);

      set({ authUser: res.data.data });
      console.log("res in updateAvatar:", res.data.data);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.log("error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
