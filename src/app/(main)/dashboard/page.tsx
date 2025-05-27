export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { CutsTable } from "@/components/CutsTable";
import Link from "next/link";
import { CutsApiResponse, CutsApiResponseMeta } from "@/types";

async function fetchCuts(
  idToken: string | undefined,
  currentPage: number,
  limit: number = 10,
  sortBy?: string,
  cutType?: string,
  material?: string
): Promise<CutsApiResponse> {
  const defaultMeta: CutsApiResponseMeta = {
    page: currentPage,
    perPage: limit,
    total: 0,
    totalPages: Math.max(1, currentPage),
  };
  if (!idToken) {
    console.error("ID Token não encontrado para a chamada da API.");
    return { data: [], meta: defaultMeta };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const effectivePage = Math.max(1, currentPage);
  const effectiveLimit = Math.max(1, limit);

  const queryParams = new URLSearchParams({
    limit: String(effectiveLimit),
    page: String(effectivePage),
  });

  if (sortBy) queryParams.append("sortBy", sortBy);
  if (cutType) queryParams.append("cutType", cutType);
  if (material) queryParams.append("material", material);

  const url = `${apiUrl}/cuts?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Erro ao buscar recortes: ${response.status} ${response.statusText}`
      );
      const errorBody = await response.text();
      console.error("Corpo do erro:", errorBody);
      return { data: [], meta: { ...defaultMeta, page: effectivePage } };
    }

    const result: CutsApiResponse = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || { ...defaultMeta, page: effectivePage },
    };
  } catch (error) {
    console.error("Falha na chamada da API de recortes:", error);
    return { data: [], meta: { ...defaultMeta, page: effectivePage } };
  }
}
interface DashboardPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    cutType?: string;
    material?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams; // aguarda a resolução da Promise

  const pageQuery = resolvedSearchParams.page;
  const limitQuery = resolvedSearchParams.limit;
  const sortByQuery = resolvedSearchParams.sortBy;
  const cutTypeFilter = resolvedSearchParams.cutType;
  const materialFilter = resolvedSearchParams.material;

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
    return null;
  }

  const idToken = session.user.idToken;

  const currentPage =
    Number(Array.isArray(pageQuery) ? pageQuery[0] : pageQuery) || 1;
  const limit =
    Number(Array.isArray(limitQuery) ? limitQuery[0] : limitQuery) || 10;
  const currentSortBy = Array.isArray(sortByQuery)
    ? sortByQuery[0]
    : sortByQuery;
  const currentCutType = Array.isArray(cutTypeFilter)
    ? cutTypeFilter[0]
    : cutTypeFilter;
  const currentMaterial = Array.isArray(materialFilter)
    ? materialFilter[0]
    : materialFilter;

  const validCurrentPage = Math.max(1, currentPage);
  const validLimit = Math.max(1, limit);

  const cutsResponse = await fetchCuts(
    idToken,
    validCurrentPage,
    validLimit,
    currentSortBy,
    currentCutType,
    currentMaterial
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Peças gerais</h1>
        <Link href="/dashboard/cuts/new">
          <button className="bg-black text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Adicionar Peça
          </button>
        </Link>
      </div>
      <CutsTable
        cuts={cutsResponse.data}
        paginationMeta={cutsResponse.meta}
        currentSortBy={currentSortBy}
      />
    </>
  );
}
