"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export function FilterDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Image
          src="/ion_filter.svg"
          alt="Icone de filtro"
          width={24}
          height={24}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-xl z-20 border border-gray-200"
          role="menu"
        >
          <div className="p-2" role="none">
            <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">
              Filtrar por
            </p>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              role="menuitem"
            >
              Tipo de Peça
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              role="menuitem"
            >
              Material
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              role="menuitem"
            >
              Posição
            </a>
            <div className="border-t border-gray-200 my-1"></div>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
              role="menuitem"
            >
              Limpar Filtros
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
