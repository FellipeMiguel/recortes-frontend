import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Session } from "next-auth";
import { CutsApiResponse } from "@/types";

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getServerSession: jest.fn(),
}));

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
  usePathname: jest.fn(() => "/dashboard"),
}));

jest.mock("@/components/CutsTable", () => ({
  __esModule: true,
  CutsTable: jest.fn(() => (
    <div data-testid="cuts-table-mock">CutsTable Mock</div>
  )),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

import DashboardPage from "./page";
import { getServerSession } from "next-auth";
import {
  redirect as nextRedirect,
  useRouter as nextUseRouter,
} from "next/navigation";
import { CutsTable } from "@/components/CutsTable";

const typedMockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const typedMockRedirect = nextRedirect as jest.MockedFunction<
  typeof nextRedirect
>;
const typedMockUseRouter = nextUseRouter as jest.MockedFunction<
  typeof nextUseRouter
>;

describe("DashboardPage Server Component", () => {
  const mockValidSession: Session = {
    user: {
      name: "Test User",
      email: "test@example.com",
      image: null,
      idToken: "mock-id-token-123",
    },
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };

  const mockApiResponse: CutsApiResponse = {
    data: [
      {
        id: 1,
        modelName: "Boné Alpha",
        sku: "SKU001",
        productType: "Boné",
        displayOrder: 1,
        status: "ATIVO",
        imageUrl: "",
        cutType: "",
        position: "",
        material: "",
        materialColor: "",
        userId: "",
        createdAt: "",
        updatedAt: "",
      },
    ],
    meta: { page: 1, perPage: 10, total: 1, totalPages: 1 },
  };

  let mockRouterPushFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouterPushFn = jest.fn();
    typedMockUseRouter.mockReturnValue({
      push: mockRouterPushFn,
      back: jest.fn(),
      prefetch: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
      text: async () => JSON.stringify(mockApiResponse),
    } as Response);
    typedMockGetServerSession.mockReset();
  });

  it("should redirect to /login if no session is found", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(null);
    await DashboardPage({ searchParams: {} });
    expect(typedMockGetServerSession).toHaveBeenCalled();
    expect(typedMockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should fetch cuts and render CutsTable with correct props if session exists", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(mockValidSession);
    const searchParams = { page: "1", sortBy: "modelName" };

    const PageComponent = await DashboardPage({ searchParams });
    render(PageComponent);

    expect(typedMockGetServerSession).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`limit=10&page=1&sortBy=modelName`),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockValidSession.user.idToken}` },
        })
      );
    });

    expect(CutsTable as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        cuts: mockApiResponse.data,
        paginationMeta: mockApiResponse.meta,
        currentSortBy: "modelName",
      }),
      undefined
    );
    expect(typedMockRedirect).not.toHaveBeenCalled();
  });

  it("should handle API fetch error gracefully and call CutsTable with empty data", async () => {
    typedMockGetServerSession.mockResolvedValueOnce(mockValidSession);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ message: "Erro da API" }),
      text: async () => "Erro da API",
    } as Response);

    const PageComponent = await DashboardPage({ searchParams: {} });
    render(PageComponent);

    await waitFor(() => {
      expect(CutsTable as jest.Mock).toHaveBeenCalledWith(
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
