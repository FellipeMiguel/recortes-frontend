"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { useState, forwardRef } from "react";

const createCutSchema = z.object({
  modelName: z.string().min(1, "Nome do modelo é obrigatório"),
  cutType: z.string().min(1, "Tipo do recorte é obrigatório"),
  position: z.string().min(1, "Posição da imagem é obrigatória"),
  displayOrder: z.coerce.number().positive("Ordem deve ser um número positivo"),
  fabric: z.string().min(1, "Tecido é obrigatório"),
  fabricColor: z.string().optional(),
  sku: z.string().min(1, "SKU é obrigatório"),
  status: z.enum(["ATIVO", "PENDENTE"]),
  image: z.instanceof(File, { message: "A imagem é obrigatória." }),
});

type CreateCutForm = z.infer<typeof createCutSchema>;

export default function NewCutPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateCutForm>({
    resolver: zodResolver(createCutSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<CreateCutForm> = (data) => {
    console.log("Form data:", data);
    alert("Formulário pronto para ser enviado! Verifique o console.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Nova Peça</h1>
            {isDirty && (
              <p className="text-sm text-yellow-600">Alterações não salvas</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value="ATIVO"
                className="sr-only peer"
                {...register("status")}
                defaultChecked
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Descartar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
          >
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Especificações</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Nome do modelo"
                error={errors.modelName}
                {...register("modelName")}
              />
              <SelectField
                label="Tipo do recorte"
                error={errors.cutType}
                {...register("cutType")}
              >
                <option value="">Selecionar...</option>
                <option value="Americano">Americano</option>
                <option value="Europeu">Europeu</option>
              </SelectField>
              <SelectField
                label="Posição da imagem"
                error={errors.position}
                {...register("position")}
              >
                <option value="">Selecionar...</option>
                <option value="Frente">Frente</option>
                <option value="Costas">Costas</option>
              </SelectField>
              <InputField
                label="Ordem de exibição"
                type="number"
                error={errors.displayOrder}
                {...register("displayOrder")}
              />
              <SelectField
                label="Tecido"
                error={errors.fabric}
                {...register("fabric")}
              >
                <option value="">Selecionar...</option>
                <option value="Algodão">Algodão</option>
                <option value="Poliéster">Poliéster</option>
              </SelectField>
              <InputField
                label="Cor do tecido"
                error={errors.fabricColor}
                {...register("fabricColor")}
              />
            </div>
          </div>
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
                      <span className="font-semibold">Clique para enviar</span>{" "}
                      ou arraste e solte
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    {...register("image", { onChange: handleImageChange })}
                  />
                </label>
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Dados do produto</h2>
            <InputField label="SKU" error={errors.sku} {...register("sku")} />
          </div>
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Chave key gerada</h2>
            <input
              type="text"
              readOnly
              value="a-ser-gerado-automaticamente"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: { message?: string };
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
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

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: { message?: string };
  children: React.ReactNode;
};

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
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
