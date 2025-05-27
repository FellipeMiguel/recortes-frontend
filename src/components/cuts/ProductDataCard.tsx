"use client";

import { forwardRef } from "react";
import {
  UseFormRegister,
  FieldErrors,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";

interface BaseFormValues extends FieldValues {
  body: {
    sku?: string;
  };
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

const InputField = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, name, ...props }, ref) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        {...props}
        ref={ref}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
);
InputField.displayName = "InputField";

export interface ProductDataCardProps<TFormValues extends BaseFormValues> {
  register: UseFormRegister<TFormValues>;
  errors?: FieldErrors<TFormValues["body"]>;
  generatedKey?: string;
}

export function ProductDataCard<TFormValues extends BaseFormValues>({
  register,
  errors = {},
  generatedKey,
}: ProductDataCardProps<TFormValues>) {
  const skuError = errors?.sku as FieldError | undefined;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Dados do produto</h2>
        <InputField
          label="SKU"
          error={skuError}
          {...register("body.sku" as Path<TFormValues>)}
        />
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Chave key gerada</h2>
        <input
          type="text"
          readOnly
          value={generatedKey || "Preencha os campos para pré-visualizar..."}
          placeholder="Chave gerada a partir da imagem salva"
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
        />
      </div>
    </div>
  );
}
