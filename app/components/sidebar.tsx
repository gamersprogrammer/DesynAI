"use client";
import Image from "next/image";
import Link from "next/link";
import { Home, BarChart2, Settings, LogOut, Sparkles, PersonStanding, Folder, Menu, X } from "lucide-react";
import { useState } from "react";

const items = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Trends", icon: BarChart2, href: "/trends" },
  { label: "Projects", icon: Folder, href:"/projects" },
  { label: "Desyn", icon: Sparkles, href: "/desyn"  },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button for small screens */}
      <button
        className="md:hidden fixed top-4 left-8 z-50 p-2 rounded-md bg-gray-800 text-white shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-60 p-6 flex flex-col gap-6 bg-[#0b0c10] border-r border-gray-700
          transform ${open ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex
        `}
      >
        {/* Close button for mobile */}
        <div className="flex justify-end md:hidden">
          <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl avatar-gradient flex items-center justify-center text-white text-lg font-bold">
              <Image src="/logo.jpeg" alt="Desyn.ai" width={28} height={28} />
          </div>
          <div className="text-xs text-[var(--muted)]">Desyn·AI</div>
        </div>

        {/* Menu */}
        <nav className="flex-1 mt-2 min-h-screen">
          <ul className="">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.label}>
                  <Link href={it.href} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition">
                    <span className="p-2 rounded-md text-[#b0b7c3] bg-[rgba(255,255,255,0.02)]">
                      <Icon className="w-5 h-5 group-hover:text-white transition"/>
                    </span>
                    <span className="text-sm text-[#b0b7c3] group-hover:text-white transition">{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
