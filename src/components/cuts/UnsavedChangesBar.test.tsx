import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UnsavedChangesBar } from "./UnsavedChangesBar";

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  Info: () => <svg data-testid="info-icon" />,
}));

describe("UnsavedChangesBar Component", () => {
  const mockOnSave = jest.fn();
  const mockOnDiscard = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnDiscard.mockClear();
  });

  it("should render correctly when not saving", () => {
    render(
      <UnsavedChangesBar
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        isSaving={false}
      />
    );

    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();

    const discardButton = screen.getByRole("button", { name: /descartar/i });
    expect(discardButton).toBeInTheDocument();
    expect(discardButton).not.toBeDisabled();

    const saveButton = screen.getByRole("button", { name: /salvar/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
    expect(saveButton).toHaveTextContent("Salvar");
  });

  it("should render correctly and disable buttons when saving", () => {
    render(
      <UnsavedChangesBar
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        isSaving={true}
      />
    );

    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();

    const discardButton = screen.getByRole("button", { name: /descartar/i });
    expect(discardButton).toBeInTheDocument();
    expect(discardButton).toBeDisabled();

    const saveButton = screen.getByRole("button", { name: /salvando.../i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    expect(screen.getByText("Salvando...")).toBeInTheDocument();
  });

  it("should call onDiscard when discard button is clicked", () => {
    render(
      <UnsavedChangesBar
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        isSaving={false}
      />
    );

    const discardButton = screen.getByRole("button", { name: /descartar/i });
    fireEvent.click(discardButton);

    expect(mockOnDiscard).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should call onSave when save button is clicked and not saving", () => {
    render(
      <UnsavedChangesBar
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        isSaving={false}
      />
    );

    const saveButton = screen.getByRole("button", { name: /salvar/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnDiscard).not.toHaveBeenCalled();
  });

  it("should not call onSave when save button is clicked and isSaving is true (button is disabled)", () => {
    render(
      <UnsavedChangesBar
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
        isSaving={true}
      />
    );

    const saveButton = screen.getByRole("button", { name: /salvando.../i });

    fireEvent.click(saveButton);

    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
