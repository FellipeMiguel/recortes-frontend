"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";

import { NewCutPageHeader } from "@/components/cuts/NewCutPageHeader";
import { SpecificationsCard } from "@/components/cuts/SpecificationsCard";
import { MediaCard } from "@/components/cuts/MediaCard";
import { ProductDataCard } from "@/components/cuts/ProductDataCard";
import { UnsavedChangesBar } from "@/components/cuts/UnsavedChangesBar";

const createCutSchema = z.object({
  body: z.object({
    modelName: z.string().min(1, "Nome do modelo é obrigatório"),
    sku: z.string().min(1, "SKU é obrigatório"),
    cutType: z.string().min(1, "Tipo do recorte é obrigatório"),
    position: z.string().min(1, "Posição da imagem é obrigatória"),
    productType: z.string().min(1, "Tipo de produto é obrigatório"),
    material: z.string().min(1, "Material é obrigatório"),
    materialColor: z.string().optional(),
    displayOrder: z.coerce
      .number()
      .positive("Ordem deve ser um número positivo"),
    status: z.enum(["ATIVO", "PENDENTE"]).optional(),
  }),
  file: z.instanceof(File, { message: "A imagem é obrigatória." }),
});
export type CreateCutForm = z.infer<typeof createCutSchema>;

export default function NewCutPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showUnsavedBar, setShowUnsavedBar] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateCutForm>({
    resolver: zodResolver(createCutSchema),
    defaultValues: {
      body: {
        status: "ATIVO",
        modelName: "",
        sku: "",
        cutType: "",
        position: "",
        productType: "",
        material: "",
        materialColor: "",
        displayOrder: 1,
      },
      file: undefined,
    },
  });

  const watchedStatus = watch("body.status");

  useEffect(() => {
    if (isDirty) {
      setShowUnsavedBar(true);
    } else {
      setShowUnsavedBar(false);
    }
  }, [isDirty]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<CreateCutForm> = (data) => {
    console.log("Form data:", data);
    const formData = new FormData();
    const statusValue = data.body?.status ? "ATIVO" : "PENDENTE";

    if (data.file) {
      formData.append("image", data.file);
    }
    const bodyData = { ...data.body, status: statusValue };
    Object.entries(bodyData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    alert("Formulário validado com sucesso! Veja o console.");
  };

  const handleDiscard = () => {
    reset();
    setImagePreview(null);
    console.log("Alterações descartadas");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div
        className={`
          sticky top-0 left-0 right-0 z-30 
          transition-all duration-500 ease-in-out 
          ${
            showUnsavedBar
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-12 pointer-events-none"
          }
        `}
      >
        {isDirty && (
          <UnsavedChangesBar
            onSave={handleSubmit(onSubmit)}
            onDiscard={handleDiscard}
          />
        )}
      </div>

      <NewCutPageHeader register={register} currentStatus={watchedStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SpecificationsCard register={register} errors={errors.body} />
          <MediaCard
            register={register}
            errors={errors}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ProductDataCard register={register} errors={errors.body} />
        </div>
      </div>
    </form>
  );
}
