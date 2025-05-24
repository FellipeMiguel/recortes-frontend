"use client";

import { Info } from "lucide-react";

interface UnsavedChangesBarProps {
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export function UnsavedChangesBar({
  onSave,
  onDiscard,
  isSaving = false,
}: UnsavedChangesBarProps) {
  return (
    <div className="bg-[#F2F2F7] shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <p className="text-sm text-gray-700">Alterações não salvas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDiscard}
            type="button"
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Descartar
          </button>
          <button
            onClick={onSave}
            type="button"
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center min-w-[100px]" // Adicionado min-w para evitar encolhimento
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
