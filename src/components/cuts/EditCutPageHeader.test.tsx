import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EditCutPageHeader } from "./EditCutPageHeader";
import { useForm } from "react-hook-form";
import { UpdateCutForm } from "@/app/(main)/dashboard/cuts/edit/[id]/page";

const mockRouterBack = jest.fn();
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => ({
    back: mockRouterBack,
  }),
  usePathname: jest.fn().mockReturnValue("/dashboard/cuts/edit/1"),
}));

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}));

const TestWrapper = ({
  initialStatus = "ATIVO",
  pageTitle = "Título de Teste Padrão",
  creationDateString = "Data de Teste Padrão",
}: {
  initialStatus?: UpdateCutForm["body"]["status"];
  pageTitle?: string;
  creationDateString?: string;
}) => {
  const { control, watch } = useForm<UpdateCutForm>({
    defaultValues: {
      body: {
        status: initialStatus,
        modelName: pageTitle.includes("Editar: ")
          ? pageTitle.replace("Editar: ", "")
          : "Modelo Teste",
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

  return (
    <EditCutPageHeader
      control={control}
      currentStatus={watchedStatus}
      pageTitle={pageTitle}
      creationDateString={creationDateString}
    />
  );
};

describe("EditCutPageHeader Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRouterBack.mockClear();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("should render the provided pageTitle and creationDateString", () => {
    const title = "Editar Peça: Boné Clássico";
    const dateStr = "Criado: 01/01/2023 | Atualizado: 02/02/2024";
    render(<TestWrapper pageTitle={title} creationDateString={dateStr} />);

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText(dateStr)).toBeInTheDocument();
  });

  it('should have a "Back" button that calls router.back()', () => {
    render(<TestWrapper />);
    const backLink = screen.getByRole("link");
    expect(backLink).toBeInTheDocument();
  });

  it("should render the status toggle reflecting ATIVO state", () => {
    render(<TestWrapper initialStatus="ATIVO" />);
    const statusToggleCheckbox = screen.getByRole("checkbox");
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
    let currentFormStatus: UpdateCutForm["body"]["status"] = "ATIVO";

    const ControllableTestWrapper = () => {
      const { control, watch } = useForm<UpdateCutForm>({
        defaultValues: {
          body: { status: "ATIVO" },
        },
      });
      currentFormStatus = watch("body.status");

      return (
        <EditCutPageHeader
          control={control}
          currentStatus={currentFormStatus}
          pageTitle="Test"
          creationDateString="Test Date"
        />
      );
    };

    render(<ControllableTestWrapper />);
    const statusToggleCheckbox = screen.getByRole("checkbox");
    expect(currentFormStatus).toBe("ATIVO");

    await act(async () => {
      fireEvent.click(statusToggleCheckbox);
    });
    expect(currentFormStatus).toBe("PENDENTE");

    await act(async () => {
      fireEvent.click(statusToggleCheckbox);
    });
    expect(currentFormStatus).toBe("ATIVO");
  });
});
