import { getServerSession, Session } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CutsTable } from "@/components/CutsTable";
import Link from "next/link";
import { CutsApiResponse, CutsApiResponseMeta } from "@/types";

export const dynamic = "force-dynamic";

async function fetchCuts(
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
    console.error("ID Token não encontrado para a chamada da API.");
    return { data: [], meta: defaultMeta };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const effectivePage = Math.max(1, currentPage);
  const effectiveLimit = Math.max(1, limit);

  const queryParams = new URLSearchParams({
    limit: String(effectiveLimit),
    page: String(effectivePage),
  });

  if (sortBy) queryParams.append("sortBy", sortBy);

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
  searchParams: {
    page?: string;
    limit?: string;
    sortBy?: string;
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
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

  const cutsResponse = await fetchCuts(
    idToken,
    validCurrentPage,
    validLimit,
    sortByQuery
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
        currentSortBy={sortByQuery}
      />
    </>
  );
}
