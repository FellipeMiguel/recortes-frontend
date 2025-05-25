"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

import { EditCutPageHeader } from "@/components/cuts/EditCutPageHeader";
import { SpecificationsCard } from "@/components/cuts/SpecificationsCard";
import { MediaCard } from "@/components/cuts/MediaCard";
import { ProductDataCard } from "@/components/cuts/ProductDataCard";
import { UnsavedChangesBar } from "@/components/cuts/UnsavedChangesBar";
import { Cut } from "@/types";

const updateCutSchema = z.object({
  body: z.object({
    modelName: z.string().min(1, "Nome do modelo é obrigatório"),
    sku: z.string().min(1, "SKU é obrigatório"),
    cutType: z.string().min(1, "Tipo do recorte é obrigatório"),
    position: z.string().min(1, "Posição da imagem é obrigatória"),
    productType: z.string().min(1, "Tipo de produto é obrigatório"),
    material: z.string().min(1, "Material é obrigatório"),
    materialColor: z.string().nullable().optional(),
    displayOrder: z.coerce
      .number()
      .positive("Ordem deve ser um número positivo"),
    status: z.enum(["ATIVO", "PENDENTE"]).optional(),
  }),
  file: z.instanceof(File).nullable().optional(),
});
export type UpdateCutForm = z.infer<typeof updateCutSchema>;

const defaultFormValues: UpdateCutForm = {
  body: {
    modelName: "",
    sku: "",
    cutType: "",
    position: "",
    productType: "",
    material: "",
    materialColor: null,
    displayOrder: 1,
    status: "ATIVO",
  },
  file: null,
};

function extractKeyFromImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return "Chave não disponível";
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const fileNameWithExtension = pathParts[pathParts.length - 1];
    const key =
      fileNameWithExtension.substring(
        0,
        fileNameWithExtension.lastIndexOf(".")
      ) || fileNameWithExtension;
    return key;
  } catch (e) {
    console.error("Erro ao parsear imageUrl:", e);

    const parts = imageUrl.split("/");
    const lastPart = parts[parts.length - 1];
    return (
      lastPart.substring(0, lastPart.lastIndexOf(".")) ||
      lastPart ||
      "Formato de URL inválido"
    );
  }
}

export default function EditCutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const cutId = params.id as string;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [originalCutData, setOriginalCutData] = useState<Cut | null>(null);
  const [generatedKeyString, setGeneratedKeyString] = useState<string>(""); // Estado para a chave extraída

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<UpdateCutForm>({
    resolver: zodResolver(updateCutSchema),
    defaultValues: defaultFormValues,
  });

  const watchedStatus = watch("body.status");

  useEffect(() => {
    if (cutId && session?.user?.idToken) {
      const fetchCutData = async () => {
        setIsLoadingData(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        try {
          const response = await fetch(`${apiUrl}/cuts/${cutId}`, {
            headers: { Authorization: `Bearer ${session.user.idToken}` },
          });
          if (!response.ok)
            throw new Error("Falha ao buscar dados do recorte para edição.");

          const data: Cut = await response.json();
          setOriginalCutData(data);
          setGeneratedKeyString(extractKeyFromImageUrl(data.imageUrl));

          reset({
            body: {
              modelName: data.modelName,
              sku: data.sku,
              cutType: data.cutType,
              position: data.position,
              productType: data.productType,
              material: data.material,
              materialColor: data.materialColor || null,
              displayOrder: data.displayOrder,
              status:
                data.status === "ATIVO" || data.status === "PENDENTE"
                  ? data.status
                  : "ATIVO",
            },
            file: null,
          });
          if (data.imageUrl) setImagePreview(data.imageUrl);
        } catch (error) {
          console.error("Erro ao buscar recorte:", error);
          alert(
            error instanceof Error
              ? error.message
              : "Erro ao carregar dados para edição."
          );
          setGeneratedKeyString("Erro ao obter chave");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchCutData();
    }
  }, [cutId, session, reset]);

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
      setImagePreview(originalCutData?.imageUrl || null);
      setGeneratedKeyString(extractKeyFromImageUrl(originalCutData?.imageUrl));
    }
  };

  const onUpdateSubmit: SubmitHandler<UpdateCutForm> = async (data) => {
    if (!data.file && !originalCutData?.imageUrl) {
      alert("A imagem é obrigatória se não houver uma existente.");
      return;
    }
    if (!session?.user?.idToken) {
      alert("Erro de autenticação.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();

    if (data.file instanceof File) {
      formData.append("image", data.file);
    }

    const statusValue = data.body?.status || "ATIVO";
    const bodyToSubmit = { ...data.body, status: statusValue };

    for (const key in bodyToSubmit) {
      const K = key as keyof typeof bodyToSubmit;
      const value = bodyToSubmit[K];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${apiUrl}/cuts/${cutId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.user.idToken}` },
        body: formData,
      });

      if (!response.ok) {
        let errorData: {
          message?: string;
          errors?: { field: string; issue: string }[];
        } = {};
        try {
          errorData = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
        const message =
          errorData?.message ||
          errorData?.errors?.[0]?.issue ||
          `Falha ao atualizar: ${response.statusText || response.status}`;
        throw new Error(message);
      }

      const updatedCutData: Cut = await response.json();
      alert("Recorte atualizado com sucesso!");

      reset({
        body: {
          modelName: updatedCutData.modelName,
          sku: updatedCutData.sku,
          cutType: updatedCutData.cutType,
          position: updatedCutData.position,
          productType: updatedCutData.productType,
          material: updatedCutData.material,
          materialColor: updatedCutData.materialColor || null,
          displayOrder: updatedCutData.displayOrder,
          status:
            updatedCutData.status === "ATIVO" ||
            updatedCutData.status === "PENDENTE"
              ? updatedCutData.status
              : "ATIVO",
        },
        file: null,
      });
      setOriginalCutData(updatedCutData);
      if (updatedCutData.imageUrl) {
        setImagePreview(updatedCutData.imageUrl);
        setGeneratedKeyString(extractKeyFromImageUrl(updatedCutData.imageUrl));
      }
    } catch (error) {
      let errorMessage = "Não foi possível atualizar o recorte.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Erro ao submeter atualização:", error);
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.idToken || !cutId) return;
    if (!window.confirm("Tem certeza que deseja excluir esta peça?")) return;
    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${apiUrl}/cuts/${cutId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.user.idToken}` },
      });
      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
        throw new Error(
          errorData.message ||
            `Falha ao excluir: ${response.statusText || response.status}`
        );
      }
      alert("Recorte excluído com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      let errorMessage = "Não foi possível excluir o recorte.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Erro ao excluir:", error);
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (originalCutData) {
      reset({
        body: {
          modelName: originalCutData.modelName,
          sku: originalCutData.sku,
          cutType: originalCutData.cutType,
          position: originalCutData.position,
          productType: originalCutData.productType,
          material: originalCutData.material,
          materialColor: originalCutData.materialColor || null,
          displayOrder: originalCutData.displayOrder,
          status:
            originalCutData.status === "ATIVO" ||
            originalCutData.status === "PENDENTE"
              ? originalCutData.status
              : "ATIVO",
        },
        file: null,
      });
      setImagePreview(originalCutData.imageUrl || null);
      setGeneratedKeyString(extractKeyFromImageUrl(originalCutData.imageUrl));
    }
  };

  if (isLoadingData)
    return <div className="p-8 text-center">Carregando dados da peça...</div>;
  if (!originalCutData)
    return (
      <div className="p-8 text-center text-red-500">Peça não encontrada.</div>
    );

  return (
    <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-6">
      {isDirty && (
        <div
          className={`sticky top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out opacity-100 translate-y-0`}
        >
          <UnsavedChangesBar
            onSave={handleSubmit(onUpdateSubmit)}
            onDiscard={handleDiscard}
            isSaving={isSubmitting}
          />
        </div>
      )}

      <EditCutPageHeader
        control={control}
        currentStatus={watchedStatus}
        pageTitle={
          originalCutData?.modelName
            ? `Editar: ${originalCutData.modelName}`
            : "Editar Peça"
        }
        creationDateString={
          originalCutData
            ? `Criado: ${new Date(originalCutData.createdAt).toLocaleDateString(
                "pt-BR"
              )} | Atualizado: ${new Date(
                originalCutData.updatedAt
              ).toLocaleDateString("pt-BR")}`
            : ""
        }
      />

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
            <ProductDataCard
              register={register}
              errors={errors.body}
              generatedKey={generatedKeyString}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t mt-6 flex justify-end">
        <button
          onClick={handleDelete}
          type="button"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg text-sm text-red-600 border border-red-300 hover:bg-red-50 disabled:opacity-50"
        >
          Excluir Peça
        </button>
      </div>
    </form>
  );
}
