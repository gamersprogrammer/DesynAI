"use client";
import Image from "next/image";
import Link from "next/link";
import { 
  Home, 
  Settings, 
  Sparkles, 
  Folder, 
  Menu, 
  X, 
  PanelLeft, 
  PanelRight 
} from "lucide-react";
import { useState } from "react";

const items = [
  { label: "Dashboard", icon: Home, href: "/" },
  // { label: "Activities", icon: BarChart2, href: "/" },
  { label: "Projects", icon: Folder, href:"/projects" },
  { label: "Desyn", icon: Sparkles, href: "/desyn"  },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  // Mobile drawer state
  const [open, setOpen] = useState(false);
  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          fixed top-0 left-0 min-h-screen z-50 p-4 flex flex-col gap-6 bg-[#0b0c10] border-r border-gray-700
          transform ${open ? "translate-x-0" : "-translate-x-full"} 
          transition-all duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex
          ${isCollapsed ? "md:w-20" : "md:w-60"} 
        `}
      >
        {/* --- Header Area: Logo & Toggles --- */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 min-w-[2.5rem] rounded-xl avatar-gradient flex items-center justify-center text-white text-lg font-bold">
               {/* Ensure you have a valid fallback if image fails, or keep using Image */}
               <Image src="/logo.jpeg" alt="Desyn.ai" width={24} height={24} className="rounded-lg"/>
            </div>
            {/* Hide text when collapsed */}
            <div className={`text-xs text-[var(--muted)] transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 block"}`}>
              Desyn·AI
            </div>
          </div>

          {/* Desktop Toggle Button (Only visible on MD screens) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${isCollapsed && "hidden"}`}
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          {/* Mobile Close Button */}
          <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded-md hover:bg-gray-700">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* --- Menu --- */}
        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-2">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.label}>
                  <Link 
                    href={it.href} 
                    className={`
                      group flex items-center p-2 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-all
                      ${isCollapsed ? "justify-center" : "gap-3"}
                    `}
                    title={isCollapsed ? it.label : ""} // Tooltip when collapsed
                  >
                    <span className="p-2 rounded-md text-[#b0b7c3] bg-[rgba(255,255,255,0.02)] group-hover:bg-[rgba(255,255,255,0.05)] transition">
                      <Icon className="w-5 h-5 group-hover:text-white transition"/>
                    </span>
                    
                    {/* Label Text */}
                    <span 
                      className={`
                        text-sm text-[#b0b7c3] group-hover:text-white transition-all whitespace-nowrap overflow-hidden
                        ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}
                      `}
                    >
                      {it.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* --- Bottom Toggle (Optional alternative location) --- */}
        {isCollapsed && (
             <button 
             onClick={() => setIsCollapsed(false)}
             className="hidden md:flex justify-center p-2 mt-auto rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
           >
             <PanelRight className="w-5 h-5" />
           </button>
        )}
      </aside>
    </>
  );
}