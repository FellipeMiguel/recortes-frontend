import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NewCutPageHeader } from "./NewCutPageHeader";
import { useForm } from "react-hook-form";
import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page";
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue("/dashboard/cuts/new"),
}));

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}));

const TestWrapper = ({
  initialStatus = "ATIVO",
}: {
  initialStatus?: CreateCutForm["body"]["status"];
}) => {
  const { control, watch } = useForm<CreateCutForm>({
    defaultValues: {
      body: {
        status: initialStatus,
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
    const dateElement = await screen.findByText(/de FANATION/i);
    expect(dateElement).toBeInTheDocument();
    expect(dateElement.textContent).toMatch(
      /\d{1,2} de \w{3}\. de \d{4}, \d{2}:\d{2} de FANATION/
    );
  });

  it('should have a "Back" link pointing to /dashboard', () => {
    render(<TestWrapper />);
    const backLink = screen.getByRole("link");
    expect(backLink).toHaveAttribute("href", "/dashboard");
    expect(within(backLink).getByTestId("arrow-left-icon")).toBeInTheDocument();
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
    let currentFormStatus: CreateCutForm["body"]["status"] = "ATIVO";

    const ControllableTestWrapper = () => {
      const { control, watch } = useForm<CreateCutForm>({
        defaultValues: { body: { status: "ATIVO" } },
      });
      currentFormStatus = watch("body.status");

      return (
        <NewCutPageHeader control={control} currentStatus={currentFormStatus} />
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
