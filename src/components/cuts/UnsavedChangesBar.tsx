"use client";

import { Info } from "lucide-react";

interface UnsavedChangesBarProps {
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesBar({
  onSave,
  onDiscard,
}: UnsavedChangesBarProps) {
  return (
    <div className="bg-[#F2F2F7] shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-[#212121]" />
          <p className="text-sm text-gray-700">Alterações não salvas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDiscard}
            type="button"
            className="px-4 py-2 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
          >
            Descartar
          </button>
          <button
            onClick={onSave}
            type="button"
            className="px-4 py-2 rounded-lg text-sm bg-black text-white font-semibold hover:bg-gray-800"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
