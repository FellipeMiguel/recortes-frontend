"use client";

import { RecorteStatus } from "@/types";

interface StatusPillProps {
  status: RecorteStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  switch (status) {
    case "ATIVO":
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#EAF7ED] text-[#2F843F]">
          Ativo
        </span>
      );
    case "EXPIRADO":
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Expirado
        </span>
      );
    case "PENDENTE":
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pendente
        </span>
      );
    default:
      const exhaustiveCheck: never = status;
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {exhaustiveCheck || String(status)}{" "}
        </span>
      );
  }
}
