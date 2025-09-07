import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "cupcake",

  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);

    // Apply theme to document element as well
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
}));
