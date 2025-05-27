// src/app/(main)/visualization/page.test.tsx
"use client";

import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Session } from "next-auth";
import { CutsApiResponse } from "@/types";

// --- MOCKS ---

// Mock para 'next-auth'. getServerSession é definido DENTRO da factory.
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getServerSession: jest.fn(),
}));

// Mock para 'next/navigation'. Funções são definidas DENTRO da factory.
jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => "/visualization"), // Pathname para esta página
}));

// Mock para VisualizationTable
jest.mock("@/components/cuts/VisualizationTable", () => ({
  __esModule: true,
  VisualizationTable: jest.fn(() => (
    <div data-testid="visualization-table-mock">VisualizationTable Mock</div>
  )),
}));

// Mock para o fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Importa o componente VisualizationPage e as funções mockadas DEPOIS de todos os mocks de módulo
import VisualizationPage from "./page";
import { getServerSession } from "next-auth"; // Importa a versão mockada
import { redirect as nextRedirect } from "next/navigation"; // Importa redirect mockado
import { VisualizationTable } from "@/components/cuts/VisualizationTable"; // Importa a versão mockada

// Tipagem para os mocks para facilitar o uso nos testes
const typedMockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const typedMockRedirect = nextRedirect as jest.MockedFunction<
  typeof nextRedirect
>;

describe("VisualizationPage Server Component", () => {
  const mockValidSession: Session = {
    user: {
      name: "Visual User",
      email: "vis@example.com",
      image: null,
      idToken: "mock-vis-id-token-456",
    },
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };

  const mockCutsApiResponse: CutsApiResponse = {
    data: [
      {
        id: 101,
        modelName: "Peça Vis Alpha",
        sku: "VIS001",
        productType: "Boné Vis",
        displayOrder: 1,
        status: "ATIVO",
        imageUrl: "vis_alpha.png",
        cutType: "frente",
        position: "topo",
        material: "algodao",
        materialColor: "preto",
        userId: "vis-user-id",
        createdAt: "",
        updatedAt: "",
      },
    ],
    meta: { page: 1, perPage: 10, total: 1, totalPages: 1 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCutsApiResponse,
      text: async () => JSON.stringify(mockCutsApiResponse),
    } as Response);
    typedMockGetServerSession.mockReset();
  });

  it("should redirect to /login if no session is found", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(null);
    await VisualizationPage({ searchParams: {} });
    expect(typedMockGetServerSession).toHaveBeenCalled();
    expect(typedMockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should fetch cuts and pass correct props to VisualizationTable if session exists", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(mockValidSession);
    const searchParams = { page: "1", sortBy: "displayOrder" }; // Exemplo de searchParams

    const PageComponent = await VisualizationPage({ searchParams });
    render(PageComponent);

    expect(typedMockGetServerSession).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `http://localhost:3001/cuts?limit=10&page=1&sortBy=displayOrder`
        ),

        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockValidSession.user.idToken}` },
        })
      );
    });

    expect(VisualizationTable as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        cuts: mockCutsApiResponse.data,
        paginationMeta: mockCutsApiResponse.meta,
        currentSortBy: "displayOrder",
      }),
      undefined
    );
    expect(typedMockRedirect).not.toHaveBeenCalled();
  });

  it("should pass default pagination and sort params if not in searchParams", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(mockValidSession);

    const PageComponent = await VisualizationPage({ searchParams: {} }); // Sem searchParams
    render(PageComponent);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("http://localhost:3001/cuts?limit=10&page=1"),
        expect.anything()
      );
      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl.includes("sortBy")).toBe(false);
    });

    expect(VisualizationTable as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentSortBy: undefined,
      }),
      undefined
    );
    expect(typedMockRedirect).not.toHaveBeenCalled();
  });

  it("should handle API fetch error gracefully and call VisualizationTable with empty data", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(mockValidSession);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ message: "Erro da API de Visualização" }),
      text: async () => "Erro da API de Visualização",
    } as Response);

    const PageComponent = await VisualizationPage({ searchParams: {} });
    render(PageComponent);

    await waitFor(() => {
      expect(VisualizationTable as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          cuts: [],
          paginationMeta: { page: 1, perPage: 10, total: 0, totalPages: 1 },
          currentSortBy: undefined,
        }),
        undefined
      );
    });
    expect(typedMockRedirect).not.toHaveBeenCalled();
  });
});
