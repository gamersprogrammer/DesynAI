"use client";

import Image from "next/image";
import { Search, Bell, History } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/firebase"; // adjust path if needed

interface HeaderProps {
  title?: string;
  icon?: React.ReactNode;
  onHistoryClick?: () => void;
}

export default function Header({ title, icon, onHistoryClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="flex items-center justify-between mb-6 bg-black/50 backdrop-blur-md p-6 border border-gray-800 shadow-md py-2 rounded-md">
      {/* Title & Icon */}
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <h1 className="text-xl md:text-2xl font-semibold max-md:text-xs">{title}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative max-md:hidden">
          <input
            type="text"
            placeholder="Search designs"
            className="bg-[rgba(255,255,255,0.02)] placeholder:text-[#6C737F] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#23272F]"
          />
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-[var(--muted)]" />
        </div>

        {/* History Button */}
        <button
          onClick={onHistoryClick}
          className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition">
          <Bell className="w-5 h-5" />
        </button>

        {/* Profile Image */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-700 hover:border-indigo-500 transition cursor-pointer">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "User Profile"}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm">
              {user?.displayName?.[0] || "U"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
