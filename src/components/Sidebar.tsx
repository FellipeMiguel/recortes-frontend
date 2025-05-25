"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const navLinks = [
  { name: "Peças", href: "/dashboard" },
  { name: "Visualização", href: "/visualization" },
  { name: "Clientes", href: "/clientes" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col justify-between w-64 bg-[#F2F2F7] text-[#2C2C2C] shadow-lg shadow-[#0000004D] z-40 p-2">
      <nav className="p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  pathname.startsWith("/dashboard/cuts")
                : pathname === link.href;

            return (
              <li key={link.name} className="mb-4">
                <Link
                  href={link.href}
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
      <div className="p-4">
        {" "}
        <LogoutButton />
      </div>
    </aside>
  );
};
