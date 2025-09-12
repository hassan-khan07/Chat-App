import Navbar from "./components/Navabar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/userAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect, useState } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const {
    authUser,
    checkAuth,
    isCheckingAuth,
    // onlineUsers
  } = useAuthStore();
  const { theme } = useThemeStore();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initialize theme on document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar isSidebarVisible={isSidebarVisible} setIsSidebarVisible={setIsSidebarVisible} />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage isSidebarVisible={isSidebarVisible} /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
