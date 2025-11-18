"use client";

import { useState, useEffect } from "react";
import { Settings, Moon, Sun, Bell, User, LogOut } from "lucide-react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const router = useRouter();

  // Load Google user info
  useEffect(() => {
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || "");
      setEmail(auth.currentUser.email || "");
      setPhotoURL(auth.currentUser.photoURL || "");
    }
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await auth.signOut();
      // toast.success("Logged out successfully!");
      console.log("Logged out successfully!");
      router.push("/signin"); // redirect to login page
    } catch (err) {
      console.error(err);
      // toast.error("Failed to logout.");
      console.log("Log out failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--panel)] text-white flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 max-md:mt-10">
        {/* Header */}
        <Header
          title="Settings"
          icon={<Settings className="text-indigo-400 w-7 h-7" />}
          onHistoryClick={() => setShowHistory(true)}
        />

        {/* Settings Panel */}
        <div className=" rounded-md shadow-lg p-8 space-y-6 max-w-6xl">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="text-indigo-400" /> : <Sun className="text-yellow-400" />}
              <p className="font-medium">Dark Mode</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                darkMode ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              {darkMode ? "On" : "Off"}
            </button>
          </div>

          {/* Notifications */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-indigo-400" />
              <p className="font-medium">Notifications</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                notifications ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              {notifications ? "Enabled" : "Disabled"}
            </button>
          </div> */}

          {/* Profile Section */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <User className="text-indigo-400" />
              <p className="font-medium">Profile Settings</p>
            </div>

            {photoURL && (
              <img
                src={photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full mb-3"
              />
            )}

            <input
              type="text"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled
            />

            <input
              type="email"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
              value={email}
              disabled
            />

            <div className="flex justify-between mt-4 gap-3">

              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
