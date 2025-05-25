"use client";

import { forwardRef } from "react";
import { UseFormRegister, FieldErrors, FieldError } from "react-hook-form";
import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

const InputField = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        ref={ref}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
);
InputField.displayName = "InputField";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
}

const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        ref={ref}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
);
SelectField.displayName = "SelectField";

interface SpecificationsCardProps {
  register: UseFormRegister<CreateCutForm>;
  errors?: FieldErrors<CreateCutForm["body"]>;
}

export function SpecificationsCard({
  register,
  errors = {},
}: SpecificationsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Especificações</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Nome do modelo"
          error={errors.modelName}
          {...register("body.modelName")}
        />
        <SelectField
          label="Tipo do recorte"
          error={errors.cutType}
          {...register("body.cutType")}
        >
          <option value="">Selecionar...</option>
          <option value="aba">aba</option>
          <option value="copa">copa</option>
          <option value="lateral">lateral</option>
          <option value="frente">frente</option>
        </SelectField>
        <SelectField
          label="Posição da imagem"
          error={errors.position}
          {...register("body.position")}
        >
          <option value="">Selecionar...</option>
          <option value="Frente">Frente</option>
          <option value="Lateral">Lateral</option>
          <option value="Traseira">Traseira</option>
        </SelectField>
        <SelectField
          label="Tipo de produto"
          error={errors.productType}
          {...register("body.productType")}
        >
          <option value="">Selecionar...</option>
          <option value="boné americano">boné americano</option>
          <option value="boné trucker">boné trucker</option>
        </SelectField>
        <SelectField
          label="Material"
          error={errors.material}
          {...register("body.material")}
        >
          <option value="">Selecionar...</option>
          <option value="algodão">algodão</option>
          <option value="linho">linho</option>
        </SelectField>
        <InputField
          label="Cor do material"
          error={errors.materialColor}
          {...register("body.materialColor")}
        />
        <InputField
          label="Ordem de exibição"
          type="number"
          error={errors.displayOrder}
          {...register("body.displayOrder")}
        />
      </div>
    </div>
  );
}
