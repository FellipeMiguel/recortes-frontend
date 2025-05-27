"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

const sortOptions = [
  { label: "Título", value: "modelName" },
  { label: "Material", value: "material" },
  { label: "Posição", value: "position" },
];

interface FilterDropdownProps {
  currentSortBy?: string;
  onSortChange: (sortByValue?: string) => void;
}

export function FilterDropdown({
  currentSortBy,
  onSortChange,
}: FilterDropdownProps) {
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

  const handleSortSelect = (sortByValue?: string) => {
    onSortChange(sortByValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 flex items-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Abrir menu de ordenação"
      >
        <Image
          src="/ion_filter.svg"
          alt="Icone de ordenação"
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
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm rounded-md flex justify-between items-center ${
                  currentSortBy === option.value
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="menuitem"
              >
                {option.label}
                {currentSortBy === option.value && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={() => handleSortSelect(undefined)}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              role="menuitem"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
