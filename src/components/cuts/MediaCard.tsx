"use client";

import { UploadCloud } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page";

export interface MediaCardProps {
  register: UseFormRegister<CreateCutForm>;
  errors: FieldErrors<CreateCutForm>;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MediaCard({
  register,
  errors,
  imagePreview,
  onImageChange,
}: MediaCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Mídia</h2>
      <div className="grid grid-cols-3 gap-6 items-center">
        <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-xs text-gray-500">Preview</span>
          )}
        </div>
        <div className="col-span-2">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para enviar</span> ou
                arraste e solte
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              data-testid="image-upload-input"
              {...register("file", { onChange: onImageChange })}
            />
          </label>
          {errors.file && (
            <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
