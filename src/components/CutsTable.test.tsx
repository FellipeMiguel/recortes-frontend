// src/components/cuts/CutsTable.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CutsTable } from "./CutsTable";
import { Cut, CutsApiResponseMeta, RecorteStatus } from "@/types";
import { useRouter, useSearchParams } from "next/navigation"; // Serão mockados
import { FilterDropdown } from "./FilterDropdown";

// Mock dos componentes e hooks importados
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("./FilterDropdown", () => ({
  FilterDropdown: jest.fn(({ currentSortBy, onSortChange }) => (
    <div data-testid="filter-dropdown">
      <span>Sort By: {currentSortBy || "default"}</span>
      <button onClick={() => onSortChange("modelName")}>Sort by Name</button>
      <button onClick={() => onSortChange(undefined)}>Clear Sort</button>
    </div>
  )),
}));

jest.mock("@/components/ui/StatusPill", () => ({
  StatusPill: ({ status }: { status: RecorteStatus }) => (
    <span data-testid="status-pill">{status}</span>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Helper para dados mockados
const createMockCut = (
  id: number,
  modelName: string,
  sku: string,
  productType: string,
  displayOrder: number,
  status: RecorteStatus
): Cut => ({
  id,
  modelName,
  sku,
  productType,
  displayOrder,
  status,
  cutType: `type${id}`,
  position: `pos${id}`,
  material: `mat${id}`,
  materialColor: `color${id}`,
  imageUrl: `http://example.com/img${id}.png`,
  userId: `user${id}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mockCutsList: Cut[] = [
  createMockCut(1, "Boné Modelo Alpha", "SKU001", "Boné Americano", 1, "ATIVO"),
  createMockCut(2, "Chapéu Beta", "SKU002", "Chapéu Bucket", 2, "PENDENTE"),
  createMockCut(3, "Boné Gamma", "SKU003", "Boné Trucker", 3, "EXPIRADO"),
];

const mockPaginationMeta: CutsApiResponseMeta = {
  page: 1,
  perPage: 10,
  total: 3,
  totalPages: 1,
};

describe("CutsTable Component", () => {
  let mockRouterPush: jest.Mock;
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    mockSearchParams = new URLSearchParams(); // Inicia com params vazios
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    // Limpa mocks de componentes, se necessário (FilterDropdown é mockado por jest.mock)
    (FilterDropdown as jest.Mock).mockClear();
  });

  it("should render the table with provided cuts", () => {
    render(
      <CutsTable
        cuts={mockCutsList}
        paginationMeta={mockPaginationMeta}
        currentSortBy="displayOrder"
      />
    );

    expect(screen.getByText("Boné Modelo Alpha")).toBeInTheDocument();
    expect(screen.getByText("SKU001")).toBeInTheDocument();
    expect(screen.getByText("Chapéu Beta")).toBeInTheDocument();
    expect(screen.getByText("SKU002")).toBeInTheDocument();

    // Verifica se os StatusPills foram renderizados (usando o data-testid do mock)
    const statusPills = screen.getAllByTestId("status-pill");
    expect(statusPills[0]).toHaveTextContent("ATIVO");
    expect(statusPills[1]).toHaveTextContent("PENDENTE");
  });

  it('should display "Nenhuma peça encontrada" when cuts array is empty', () => {
    render(
      <CutsTable
        cuts={[]}
        paginationMeta={{ ...mockPaginationMeta, total: 0, totalPages: 0 }}
      />
    );
    expect(screen.getByText(/Nenhuma peça encontrada/i)).toBeInTheDocument();
  });

  it("should call onSortChange (triggering navigation) when a sort option is selected", () => {
    render(
      <CutsTable
        cuts={mockCutsList}
        paginationMeta={mockPaginationMeta}
        currentSortBy="displayOrder"
      />
    );

    // Nosso mock do FilterDropdown tem um botão "Sort by Name"
    const sortByModelNameButton = screen.getByRole("button", {
      name: "Sort by Name",
    });
    fireEvent.click(sortByModelNameButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/dashboard?sortBy=modelName&page=1"
    );
  });

  it("should navigate to the edit page when a row is clicked", () => {
    render(
      <CutsTable cuts={mockCutsList} paginationMeta={mockPaginationMeta} />
    );

    // Clica na primeira linha (que contém "Boné Modelo Alpha")
    const firstRowText = screen.getByText("Boné Modelo Alpha");
    fireEvent.click(firstRowText.closest("tr") as HTMLTableRowElement); // Clica no elemento <tr> pai

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/dashboard/cuts/edit/${mockCutsList[0].id}`
    );
  });

  describe("Pagination Links", () => {
    const paginatedMeta: CutsApiResponseMeta = {
      page: 2,
      perPage: 1,
      total: 3,
      totalPages: 3,
    };
    const paginatedCuts = [mockCutsList[1]]; // Apenas o segundo item para simular página 2

    it("should render correct pagination links and preserve sortBy", () => {
      mockSearchParams.set("sortBy", "modelName"); // Simula um sortBy ativo na URL
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(
        <CutsTable
          cuts={paginatedCuts}
          paginationMeta={paginatedMeta}
          currentSortBy="modelName"
        />
      );

      const prevLink = screen.getByRole("link", { name: "<" });
      const nextLink = screen.getByRole("link", { name: ">" });
      const page1Link = screen.getByRole("link", { name: "1" });
      const page2Link = screen.getByRole("link", { name: "2" }); // Página atual

      expect(prevLink).toHaveAttribute(
        "href",
        "/dashboard?sortBy=modelName&page=1"
      );
      expect(page1Link).toHaveAttribute(
        "href",
        "/dashboard?sortBy=modelName&page=1"
      );
      expect(page2Link).toHaveAttribute(
        "href",
        "/dashboard?sortBy=modelName&page=2"
      );
      expect(page2Link).toHaveClass("bg-black"); // Estilo de link ativo
      expect(nextLink).toHaveAttribute(
        "href",
        "/dashboard?sortBy=modelName&page=3"
      );
    });

    it('should disable "Previous" on first page and "Next" on last page', () => {
      // Teste na primeira página
      const metaFirstPage: CutsApiResponseMeta = {
        page: 1,
        perPage: 1,
        total: 2,
        totalPages: 2,
      };
      const { rerender } = render(
        <CutsTable cuts={[mockCutsList[0]]} paginationMeta={metaFirstPage} />
      );
      expect(screen.getByRole("link", { name: "<" })).toHaveClass(
        "pointer-events-none",
        "opacity-50"
      );
      expect(screen.getByRole("link", { name: ">" })).not.toHaveClass(
        "pointer-events-none",
        "opacity-50"
      );

      // Teste na última página
      const metaLastPage: CutsApiResponseMeta = {
        page: 2,
        perPage: 1,
        total: 2,
        totalPages: 2,
      };
      rerender(
        <CutsTable cuts={[mockCutsList[1]]} paginationMeta={metaLastPage} />
      );
      expect(screen.getByRole("link", { name: "<" })).not.toHaveClass(
        "pointer-events-none",
        "opacity-50"
      );
      expect(screen.getByRole("link", { name: ">" })).toHaveClass(
        "pointer-events-none",
        "opacity-50"
      );
    });
  });

  // Adicione testes para responsividade (ocultação de colunas) se desejar,
  // verificando a presença/ausência de classes como 'hidden sm:table-cell'
  // ou contando o número de 'th'/'td' visíveis em diferentes viewports (requer setup de viewport).
});
