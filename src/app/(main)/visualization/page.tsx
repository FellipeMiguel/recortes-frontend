export const dynamic = "force-dynamic";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CutsApiResponse, CutsApiResponseMeta } from "@/types";
import { VisualizationTable } from "@/components/cuts/VisualizationTable";

async function fetchCutsForVisualization(
  idToken: string | undefined,
  currentPage: number,
  limit: number = 10,
  sortBy?: string
): Promise<CutsApiResponse> {
  const defaultMeta: CutsApiResponseMeta = {
    page: currentPage,
    perPage: limit,
    total: 0,
    totalPages: Math.max(1, currentPage),
  };
  if (!idToken) {
    console.error("Visualização: ID Token não encontrado.");
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

  const url = `${apiUrl}/cuts?${queryParams.toString()}`;
  console.log("Visualização - Fetching URL:", url);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Visualização - Erro ao buscar recortes: ${response.status} ${response.statusText}`,
        errorText
      );
      return { data: [], meta: { ...defaultMeta, page: effectivePage } };
    }

    const result: CutsApiResponse = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || { ...defaultMeta, page: effectivePage },
    };
  } catch (error) {
    console.error("Visualização - Falha na chamada da API:", error);
    return { data: [], meta: { ...defaultMeta, page: effectivePage } };
  }
}

interface VisualizationPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    sortBy?: string;
  };
}

export default async function VisualizationPage({
  searchParams,
}: VisualizationPageProps) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
    return null;
  }

  const idToken = session.user.idToken;

  const pageQuery = searchParams.page;
  const limitQuery = searchParams.limit;
  const sortByQuery = searchParams.sortBy;

  const currentPage = pageQuery ? Number(pageQuery) : 1;
  const limit = limitQuery ? Number(limitQuery) : 10;

  const validCurrentPage = Math.max(1, currentPage);
  const validLimit = Math.max(1, limit);

  const cutsResponse = await fetchCutsForVisualization(
    idToken,
    validCurrentPage,
    validLimit,
    sortByQuery
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-normal text-gray-800">
          Visualização de Peças
        </h1>
      </div>
      <VisualizationTable
        cuts={cutsResponse.data}
        paginationMeta={cutsResponse.meta}
        currentSortBy={sortByQuery}
      />
    </>
  );
}
