// src/components/cuts/NewCutPageHeader.test.tsx

import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NewCutPageHeader } from "./NewCutPageHeader";
import { useForm } from "react-hook-form";
import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page"; // Ajuste o caminho

// Mock para o useRouter e usePathname
// A função router.back() não é usada pelo componente como está, ele usa <Link>
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => ({
    back: jest.fn(), // Mockado, mas não será chamado pelo <Link href="/dashboard">
    push: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue("/dashboard/cuts/new"),
}));

// Mock para lucide-react
jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  // Não precisamos mockar Check se o tooltip só mostra texto
}));

// Componente wrapper para fornecer 'control' e 'watch' do react-hook-form
const TestWrapper = ({
  initialStatus = "ATIVO",
}: {
  initialStatus?: CreateCutForm["body"]["status"];
}) => {
  const { control, watch } = useForm<CreateCutForm>({
    defaultValues: {
      body: {
        status: initialStatus,
        // Outros defaultValues de CreateCutForm não são estritamente necessários para este teste de header
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
    },
  });
  const watchedStatus = watch("body.status");

  return <NewCutPageHeader control={control} currentStatus={watchedStatus} />;
};

describe("NewCutPageHeader Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      // Envolver jest.runOnlyPendingTimers em act
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should render the title "Nova Peça" and the "Status" label', () => {
    render(<TestWrapper />);
    expect(
      screen.getByRole("heading", { name: /nova peça/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should display a formatted creation date", async () => {
    render(<TestWrapper />);
    // Espera que a parte final da string de data (que é estática) apareça
    // Usamos findByText para aguardar o useEffect que define a data
    const dateElement = await screen.findByText(/de FANATION/i);
    expect(dateElement).toBeInTheDocument();
    // Verifica se o formato geral parece correto (dia de mês de ano, hora:minuto de FANATION)
    expect(dateElement.textContent).toMatch(
      /\d{1,2} de \w{3}\. de \d{4}, \d{2}:\d{2} de FANATION/
    );
  });

  it('should have a "Back" link pointing to /dashboard', () => {
    render(<TestWrapper />);
    // O botão de voltar é um Link, então procuramos por role 'link'
    // O ícone dentro pode não dar um nome acessível ao link, então adicionamos um
    // Se o seu <ArrowLeft/> mockado tiver um data-testid, use-o.
    // Melhor seria o Link ter um aria-label="Voltar".
    // Por agora, vamos pegar o link pelo href.
    const backLink = screen.getByRole("link"); // Assume que é o único link ou o primeiro relevante
    expect(backLink).toHaveAttribute("href", "/dashboard");
    expect(within(backLink).getByTestId("arrow-left-icon")).toBeInTheDocument();
  });

  it("should render the status toggle reflecting ATIVO state", () => {
    render(<TestWrapper initialStatus="ATIVO" />);
    const statusToggleCheckbox = screen.getByRole("checkbox"); // O input real do Controller
    expect(statusToggleCheckbox).toBeInTheDocument();
    expect(statusToggleCheckbox).toBeChecked();
  });

  it("should render the status toggle reflecting PENDENTE state", () => {
    render(<TestWrapper initialStatus="PENDENTE" />);
    const statusToggleCheckbox = screen.getByRole("checkbox");
    expect(statusToggleCheckbox).toBeInTheDocument();
    expect(statusToggleCheckbox).not.toBeChecked();
  });

  it("should change status value when toggle is clicked (via Controller)", async () => {
    let currentFormStatus: CreateCutForm["body"]["status"] = "ATIVO";

    // Wrapper para capturar a mudança de valor
    const ControllableTestWrapper = () => {
      const { control, watch } = useForm<CreateCutForm>({
        defaultValues: { body: { status: "ATIVO" } },
      });
      currentFormStatus = watch("body.status"); // Atualiza a variável externa

      return (
        <NewCutPageHeader control={control} currentStatus={currentFormStatus} />
      );
    };

    render(<ControllableTestWrapper />);

    const statusToggleCheckbox = screen.getByRole("checkbox");
    expect(currentFormStatus).toBe("ATIVO");

    await act(async () => {
      fireEvent.click(statusToggleCheckbox); // Clica no input checkbox real
    });
    // Após o clique, o Controller deve ter chamado field.onChange com 'PENDENTE'
    // e o watch deve refletir isso.
    expect(currentFormStatus).toBe("PENDENTE");

    await act(async () => {
      fireEvent.click(statusToggleCheckbox);
    });
    expect(currentFormStatus).toBe("ATIVO");
  });
});
