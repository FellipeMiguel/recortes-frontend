"use client";

import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        <div className="bg-[#440986] px-4 py-3 lg:hidden flex items-center">
          <button
            onClick={toggleMobileSidebar}
            aria-label="Abrir menu"
            className="text-white p-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <Menu size={24} />
          </button>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
