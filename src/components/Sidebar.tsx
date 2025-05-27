"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import { X } from "lucide-react";

const navLinks = [
  { name: "Peças", href: "/dashboard" },
  { name: "Visualização", href: "/visualization" },
  { name: "Clientes", href: "/clientes" },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {isMobileOpen && (
        <div
          data-testid="sidebar-backdrop"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col justify-between w-64 bg-[#F2F2F7] text-[#2C2C2C] shadow-lg 
          transform transition-transform duration-300 ease-in-out 
          lg:translate-x-0 lg:static lg:shadow-lg lg:shadow-[#0000004D]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          p-2 
        `}
      >
        <div>
          <div className="flex justify-between items-center p-4 lg:hidden">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={onCloseMobile}
              className="text-[#2C2C2C] hover:text-purple-600"
              aria-label="Fechar menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="p-4">
            <ul>
              {navLinks.map((link) => {
                let isActive = false;
                if (link.href === "/dashboard") {
                  isActive =
                    pathname === "/dashboard" ||
                    pathname.startsWith("/dashboard/cuts");
                } else if (link.href === "/visualization") {
                  isActive =
                    pathname === "/visualization" ||
                    pathname.startsWith("/visualization/");
                } else {
                  isActive = pathname === link.href;
                }

                return (
                  <li key={link.name} className="mb-4">
                    <Link
                      href={link.href}
                      onClick={onCloseMobile}
                      className={`flex items-center p-3 rounded-2xl transition-colors duration-150 ease-in-out ${
                        isActive
                          ? "bg-[#5A00B4] text-white shadow-md"
                          : "hover:bg-purple-100 hover:text-[#5A00B4]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="p-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};
