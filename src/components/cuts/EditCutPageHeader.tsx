"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Control, Controller } from "react-hook-form";
import { UpdateCutForm } from "@/app/dashboard/cuts/edit/[id]/page";
import { useState } from "react";

interface EditCutPageHeaderProps {
  control: Control<UpdateCutForm>;
  currentStatus: UpdateCutForm["body"]["status"];
  pageTitle: string;
  creationDateString: string;
}

export function EditCutPageHeader({
  control,
  currentStatus,
  pageTitle,
  creationDateString,
}: EditCutPageHeaderProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleToggleClick = () => {
    setIsTooltipVisible(true);
    setTimeout(() => {
      setIsTooltipVisible(false);
    }, 2000);
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-md hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{pageTitle}</h1>
          <p className="text-sm text-gray-500">{creationDateString}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-2">
          <span className="text-sm text-gray-600">Status</span>
          <Controller
            name="body.status"
            control={control}
            render={({ field }) => (
              <label
                onClick={handleToggleClick}
                className="relative inline-flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  ref={field.ref}
                  name={field.name}
                  checked={field.value === "ATIVO"}
                  onChange={(e) =>
                    field.onChange(e.target.checked ? "ATIVO" : "PENDENTE")
                  }
                  onBlur={field.onBlur}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            )}
          />
          {isTooltipVisible && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg">
              {currentStatus === "ATIVO" ? "Ativo" : "Inativo"}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-800"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
