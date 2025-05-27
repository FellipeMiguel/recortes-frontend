"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Cut } from "@/types";
import { extractKeyFromImageUrl } from "@/utils/stringUtils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AssembledCut extends Cut {}

// Esse componente contém toda a lógica que usa o useSearchParams() e outros hooks client-side.
function AssemblyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const [assembledCuts, setAssembledCuts] = useState<AssembledCut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idsString = searchParams.get("ids");

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }
    if (!session?.user?.idToken) {
      setError("Autenticação necessária para visualizar a montagem.");
      setIsLoading(false);
      return;
    }
    if (!idsString) {
      setError("Nenhuma peça selecionada para montagem.");
      setIsLoading(false);
      return;
    }
    const idsArray = idsString
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (idsArray.length !== 3) {
      setError(
        `Número inválido de peças selecionadas (${idsArray.length}). São necessárias exatamente 3.`
      );
      setIsLoading(false);
      return;
    }

    const fetchAllCutData = async () => {
      setIsLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const fetchedCutsPromises: Promise<Cut>[] = idsArray.map((id) =>
        fetch(`${apiUrl}/cuts/${id}`, {
          headers: { Authorization: `Bearer ${session!.user.idToken}` },
        }).then(async (res) => {
          if (!res.ok) {
            let errorDetail = `Status: ${res.status}`;
            try {
              const errorJson = await res.json();
              errorDetail = errorJson.message || errorDetail;
            } catch (e) {
              console.log(e);
            }
            throw new Error(
              `Falha ao buscar dados da peça com ID ${id}. ${errorDetail}`
            );
          }
          return res.json();
        })
      );

      try {
        const cutsResults = await Promise.all(fetchedCutsPromises);
        const validCuts = cutsResults.filter(
          (cut) => cut && typeof cut.displayOrder === "number"
        ) as Cut[];
        if (validCuts.length !== 3) {
          throw new Error(
            "Não foi possível carregar todas as 3 peças selecionadas."
          );
        }
        validCuts.sort((a, b) => a.displayOrder - b.displayOrder);
        setAssembledCuts(validCuts);
      } catch (err) {
        console.error("Erro ao buscar dados das peças:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao carregar os dados das peças."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllCutData();
  }, [idsString, session, sessionStatus]);

  const pageDisplayTitle = useMemo(() => {
    if (assembledCuts.length > 0 && assembledCuts[0]?.modelName) {
      return `Montagem: ${assembledCuts[0].modelName}`;
    }
    return "Visualização da Montagem";
  }, [assembledCuts]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-8 text-gray-600">
        <svg
          className="animate-spin h-8 w-8 text-purple-600 mb-4"
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
        Carregando montagem...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6">
        <p className="text-red-500 text-lg sm:text-xl mb-6 text-center">
          {error}
        </p>
        <button
          onClick={() => router.push("/visualization")}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors"
        >
          Voltar para Seleção
        </button>
      </div>
    );
  }

  if (assembledCuts.length !== 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6">
        <p className="text-lg sm:text-xl mb-6 text-center">
          Não foi possível carregar as 3 peças para a montagem.
        </p>
        <button
          onClick={() => router.push("/visualization")}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors"
        >
          Voltar para Seleção
        </button>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-6 lg:p-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1
          className="md:text-lg text-xs font-semibold text-gray-800 truncate"
          title={pageDisplayTitle}
        >
          {pageDisplayTitle}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:w-1/3 w-full bg-white p-4 sm:p-5 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            ORDEM
          </h2>
          <p className="text-xs text-gray-500 mb-4 sm:mb-5">
            Peças selecionadas para a montagem.
          </p>

          <div className="space-y-1 text-sm">
            <div className="grid grid-cols-[1fr_auto] gap-x-2 sm:gap-x-4 pb-2 border-b mb-2">
              <span className="font-medium text-gray-500 uppercase text-xs tracking-wider">
                Key da Peça
              </span>
              <span className="font-medium text-gray-500 uppercase text-xs tracking-wider text-center">
                Ordem
              </span>
            </div>
            {assembledCuts.map((cut) => (
              <div
                key={cut.id}
                className="grid grid-cols-[1fr_auto] gap-x-2 sm:gap-x-4 py-2 items-center border-b border-gray-100 last:border-b-0"
              >
                <span
                  className="text-gray-700 truncate text-xs sm:text-sm"
                  title={extractKeyFromImageUrl(cut.imageUrl)}
                >
                  {extractKeyFromImageUrl(cut.imageUrl)}
                </span>
                <span className="text-gray-700 text-center w-10 font-medium text-xs sm:text-sm">
                  {cut.displayOrder}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-2/3 w-full bg-gray-50 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 flex justify-center items-center min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-0">
          <div className="relative w-full max-w-[90vw] h-auto sm:max-w-xs md:max-w-sm lg:max-w-[500px] aspect-[1/1]">
            {assembledCuts.map((cut, index) => (
              <Image
                key={cut.id}
                src={cut.imageUrl}
                alt={`Peça ${extractKeyFromImageUrl(cut.imageUrl)} - Camada ${
                  cut.displayOrder
                }`}
                fill
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 500px"
                style={{ objectFit: "contain" }}
                className="absolute left-0 top-0"
                priority={index < 2}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageAssemblyPage() {
  return (
    <Suspense fallback={<div>Carregando montagem...</div>}>
      <AssemblyContent />
    </Suspense>
  );
}
