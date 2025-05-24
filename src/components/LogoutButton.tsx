"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-4 px-4 py-2 bg-[#070707] text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      Sair
    </button>
  );
}
