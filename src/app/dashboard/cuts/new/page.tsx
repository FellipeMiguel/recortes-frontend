"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    materialColor: z.string().optional().nullable(),
    displayOrder: z.coerce
      .number()
      .positive("Ordem deve ser um número positivo"),
    status: z.enum(["ATIVO", "PENDENTE"]).optional(),
  }),
  file: z
    .instanceof(File, { message: "A imagem é obrigatória." })
    .optional()
    .nullable(),
});

export type CreateCutForm = z.infer<typeof createCutSchema>;

type FormDefaultValues = Omit<CreateCutForm, "file" | "body"> & {
  body: Omit<CreateCutForm["body"], "status"> & {
    status: "ATIVO" | "PENDENTE";
  };
  file?: File | null;
};

const formDefaultValues: FormDefaultValues = {
  body: {
    status: "ATIVO",
    modelName: "",
    sku: "",
    cutType: "",
    position: "",
    productType: "",
    material: "",
    materialColor: null,
    displayOrder: 1,
  },
  file: null,
};

export default function NewCutPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateCutForm>({
    resolver: zodResolver(createCutSchema),
    defaultValues: formDefaultValues,
  });

  const watchedStatus = watch("body.status");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true, shouldDirty: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue("file", null, { shouldValidate: true, shouldDirty: true });
      setImagePreview(null);
    }
  };

  const onSubmit: SubmitHandler<CreateCutForm> = async (data) => {
    if (!data.file) {
      alert("A imagem é obrigatória.");
      return;
    }
    if (!session?.user?.idToken) {
      alert("Erro de autenticação. Por favor, faça login novamente.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("image", data.file as File);

    const statusSubmitValue = data.body?.status || "ATIVO";

    Object.entries({ ...data.body, status: statusSubmitValue }).forEach(
      ([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      }
    );

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${apiUrl}/cuts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.user.idToken}` },
        body: formData,
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          throw new Error(
            `Falha ao criar recorte: ${response.status} ${response.statusText}`
          );
        }
        const message =
          errorData?.message ||
          errorData?.errors?.[0]?.issue ||
          `Falha ao criar recorte: ${response.statusText}`;
        throw new Error(message);
      }
      alert("Recorte criado com sucesso!");
      reset(formDefaultValues);
      setImagePreview(null);
      router.push("/dashboard");
    } catch (error) {
      let errorMessage = "Não foi possível criar o recorte.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Erro ao submeter formulário:", error);
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    reset(formDefaultValues);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div
        className={`
          sticky top-0 left-0 right-0 z-30 
          transition-all duration-300 ease-in-out
          ${
            isDirty
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }
        `}
      >
        {isDirty && (
          <UnsavedChangesBar
            onSave={handleSubmit(onSubmit)}
            onDiscard={handleDiscard}
            isSaving={isSubmitting}
          />
        )}
      </div>

      <NewCutPageHeader control={control} currentStatus={watchedStatus} />

      <div className={isDirty ? "mt-16 sm:mt-20" : ""}>
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
      </div>
    </form>
  );
}
