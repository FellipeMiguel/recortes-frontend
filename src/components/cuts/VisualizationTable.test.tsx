"use client";

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { VisualizationTable } from "./VisualizationTable";
import { Cut, CutsApiResponseMeta, RecorteStatus } from "@/types";

import { extractKeyFromImageUrl, sanitize } from "@/utils/stringUtils";

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockRouterPrefetch = jest.fn();
const mockRouterRefresh = jest.fn();
const mockRouterReplace = jest.fn();

let mockActualSearchParamsInstance = new URLSearchParams();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
    prefetch: mockRouterPrefetch,
    refresh: mockRouterRefresh,
    replace: mockRouterReplace,
  }),
  useSearchParams: () => mockActualSearchParamsInstance,
  Link: jest.fn(({ href, children, ...props }) => (
    <a href={href as string} {...props}>
      {children}
    </a>
  )),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    const { src, alt, width, height, style, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src as string}
        alt={alt as string}
        width={width as number}
        height={height as number}
        style={style}
        {...rest}
      />
    );
  },
}));

jest.mock("@/utils/stringUtils", () => ({
  __esModule: true,
  extractKeyFromImageUrl: jest.fn(), // Será acessado como utils.extractKeyFromImageUrl
  sanitize: jest.fn((val: string | null | undefined) => val || ""),
}));

jest.mock("../FilterDropdown", () => ({
  __esModule: true,
  FilterDropdown: jest.fn(({ currentSortBy, onSortChange }) => (
    <div data-testid="filter-dropdown">
      <span>Ordenado por: {currentSortBy || "Padrão"}</span>
      <button onClick={() => onSortChange("modelName")}>
        Ordenar por Nome
      </button>
      <button onClick={() => onSortChange(undefined)}>Limpar Ordenação</button>
    </div>
  )),
}));

jest.mock("@/components/ui/StatusPill", () => ({
  __esModule: true,
  StatusPill: jest.fn(({ status }: { status: string }) => (
    <span data-testid="status-pill">{status}</span>
  )),
}));

const createMockCut = (
  id: number,
  modelName: string,
  sku: string,
  productType: string,
  displayOrder: number,
  status: RecorteStatus,
  imageUrl: string
): Cut => ({
  id,
  modelName,
  sku,
  productType,
  displayOrder,
  status,
  imageUrl,
  cutType: `tipo_corte_${id}`,
  position: `pos_${id}`,
  material: `material_${id}`,
  materialColor: `cor_${id}`,
  userId: `user_${id}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mockCutsList: Cut[] = [
  createMockCut(
    1,
    "Boné Alpha",
    "SKU001",
    "Boné Americano",
    1,
    "ATIVO",
    "http://example.com/alpha.png"
  ),
  createMockCut(
    2,
    "Chapéu Beta",
    "SKU002",
    "Chapéu Bucket",
    2,
    "PENDENTE",
    "http://example.com/beta.png"
  ),
  createMockCut(
    3,
    "Viseira Gamma",
    "SKU003",
    "Viseira",
    3,
    "EXPIRADO",
    "http://example.com/gamma.png"
  ),
  createMockCut(
    4,
    "Boné Delta",
    "SKU004",
    "Boné Trucker",
    4,
    "ATIVO",
    "http://example.com/delta.png"
  ),
];

const mockPaginationMeta: CutsApiResponseMeta = {
  page: 1,
  perPage: 10,
  total: mockCutsList.length,
  totalPages: 1,
};

describe("VisualizationTable Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockActualSearchParamsInstance = new URLSearchParams();

    (extractKeyFromImageUrl as jest.Mock).mockImplementation(
      (url: string | null | undefined) => {
        if (!url) return "key_invalida_mock";
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        return filename.split(".")[0] || "key_fallback_mock";
      }
    );
    (sanitize as jest.Mock).mockImplementation((val) => val || "");

    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
  });

  it("should render table with cuts and correct keys", () => {
    render(
      <VisualizationTable
        cuts={mockCutsList}
        paginationMeta={mockPaginationMeta}
      />
    );
    expect(
      screen.getByText(extractKeyFromImageUrl(mockCutsList[0].imageUrl))
    ).toBeInTheDocument();
    expect(
      screen.getByText(extractKeyFromImageUrl(mockCutsList[1].imageUrl))
    ).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(mockCutsList.length);
  });

  it('should display "Nenhuma peça encontrada" when cuts array is empty', () => {
    render(
      <VisualizationTable
        cuts={[]}
        paginationMeta={{ ...mockPaginationMeta, total: 0, totalPages: 0 }}
      />
    );
    expect(screen.getByText(/Nenhuma peça encontrada/i)).toBeInTheDocument();
  });

  it('should enable "GERAR IMAGEM" button only when exactly 3 items are selected and call router.push on click', () => {
    render(
      <VisualizationTable
        cuts={mockCutsList}
        paginationMeta={mockPaginationMeta}
      />
    );
    const generateButton = screen.getByRole("button", {
      name: /gerar imagem/i,
    });
    const checkboxes = screen.getAllByRole("checkbox");

    expect(generateButton).toBeDisabled();

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    expect(generateButton).toBeDisabled();
    expect(screen.getByText("GERAR IMAGEM (2)")).toBeInTheDocument();

    fireEvent.click(checkboxes[2]);
    expect(generateButton).not.toBeDisabled();
    expect(screen.getByText("GERAR IMAGEM (3)")).toBeInTheDocument();

    fireEvent.click(generateButton);
    const expectedIds = [
      mockCutsList[0].id,
      mockCutsList[1].id,
      mockCutsList[2].id,
    ]
      .sort((a, b) => a - b)
      .join(",");
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/visualization/assembly?ids=${expectedIds}`
    );
  });

  it("should not allow selecting more than 3 items and alert user", () => {
    render(
      <VisualizationTable
        cuts={mockCutsList}
        paginationMeta={mockPaginationMeta}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    fireEvent.click(checkboxes[3]);
    expect(checkboxes[3].checked).toBe(false);
    expect(window.alert).toHaveBeenCalledWith(
      "Você deve selecionar 3 peças. Desmarque uma para selecionar outra, ou limpe a seleção."
    );

    const selectedCount = checkboxes.filter((cb) => cb.checked).length;
    expect(selectedCount).toBe(3);
  });

  it("should call router.push with sortBy params when sort option changes from FilterDropdown", () => {
    mockActualSearchParamsInstance = new URLSearchParams("page=1");

    render(
      <VisualizationTable
        cuts={mockCutsList}
        paginationMeta={mockPaginationMeta}
        currentSortBy="displayOrder"
      />
    );

    const sortByNameButton = screen.getByRole("button", {
      name: "Ordenar por Nome",
    });
    fireEvent.click(sortByNameButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/visualization?page=1&sortBy=modelName"
    );
  });
});
