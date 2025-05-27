import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FilterDropdown } from "./FilterDropdown";

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  SlidersHorizontal: () => (
    <svg data-testid="sliders-icon" aria-label="Abrir menu de ordenação" />
  ),
  Check: () => <svg data-testid="check-icon" />,
}));

describe("FilterDropdown Component", () => {
  const mockOnSortChange = jest.fn();

  const sortOptionsInComponent = [
    { label: "Título", value: "modelName" },
    { label: "Material", value: "material" },
    { label: "Posição", value: "position" },
  ];
  const clearSortOptionText = "Limpar";

  beforeEach(() => {
    mockOnSortChange.mockClear();
  });

  it("should render the filter button and the dropdown should be initially closed", () => {
    render(
      <FilterDropdown
        currentSortBy={undefined}
        onSortChange={mockOnSortChange}
      />
    );

    expect(
      screen.getByRole("button", { name: /abrir menu de ordenação/i })
    ).toBeInTheDocument();

    sortOptionsInComponent.forEach((option) => {
      expect(
        screen.queryByRole("menuitem", { name: option.label })
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole("menuitem", {
        name: new RegExp(clearSortOptionText, "i"),
      })
    ).not.toBeInTheDocument();
  });

  it("should open the dropdown on button click and show options", () => {
    render(
      <FilterDropdown
        currentSortBy={undefined}
        onSortChange={mockOnSortChange}
      />
    );

    const filterButton = screen.getByRole("button", {
      name: /abrir menu de ordenação/i,
    });
    fireEvent.click(filterButton);

    sortOptionsInComponent.forEach((option) => {
      expect(
        screen.getByRole("menuitem", { name: option.label })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("menuitem", {
        name: new RegExp(clearSortOptionText, "i"),
      })
    ).toBeInTheDocument();
  });

  it("should close the dropdown when clicking the button again", () => {
    render(
      <FilterDropdown
        currentSortBy={undefined}
        onSortChange={mockOnSortChange}
      />
    );

    const filterButton = screen.getByRole("button", {
      name: /abrir menu de ordenação/i,
    });
    fireEvent.click(filterButton);
    fireEvent.click(filterButton);

    expect(
      screen.queryByRole("menuitem", { name: sortOptionsInComponent[0].label })
    ).not.toBeInTheDocument();
  });

  it("should call onSortChange with the correct value and close when an option is clicked", () => {
    render(
      <FilterDropdown
        currentSortBy={undefined}
        onSortChange={mockOnSortChange}
      />
    );

    const filterButton = screen.getByRole("button", {
      name: /abrir menu de ordenação/i,
    });
    fireEvent.click(filterButton);

    const materialOption = screen.getByRole("menuitem", { name: "Material" });
    fireEvent.click(materialOption);

    expect(mockOnSortChange).toHaveBeenCalledTimes(1);
    expect(mockOnSortChange).toHaveBeenCalledWith("material");
    expect(
      screen.queryByRole("menuitem", { name: "Material" })
    ).not.toBeInTheDocument();
  });

  it("should call onSortChange with undefined when the clear sort option is clicked", () => {
    render(
      <FilterDropdown
        currentSortBy="modelName"
        onSortChange={mockOnSortChange}
      />
    );

    const filterButton = screen.getByRole("button", {
      name: /abrir menu de ordenação/i,
    });
    fireEvent.click(filterButton);

    const clearOption = screen.getByRole("menuitem", {
      name: new RegExp(clearSortOptionText, "i"),
    });
    fireEvent.click(clearOption);

    expect(mockOnSortChange).toHaveBeenCalledTimes(1);
    expect(mockOnSortChange).toHaveBeenCalledWith(undefined);
    expect(
      screen.queryByRole("menuitem", {
        name: new RegExp(clearSortOptionText, "i"),
      })
    ).not.toBeInTheDocument();
  });

  it("should highlight the current sort option", () => {
    render(
      <FilterDropdown
        currentSortBy="material"
        onSortChange={mockOnSortChange}
      />
    );

    const filterButton = screen.getByRole("button", {
      name: /abrir menu de ordenação/i,
    });
    fireEvent.click(filterButton);

    const materialOption = screen.getByRole("menuitem", { name: "Material" });
    const tituloOption = screen.getByRole("menuitem", { name: "Título" });

    expect(materialOption).toHaveClass(
      "bg-purple-100",
      "text-purple-700",
      "font-semibold"
    );
    expect(tituloOption).not.toHaveClass("bg-purple-100");
  });

  it("should close the dropdown on an outside click", () => {
    render(
      <FilterDropdown
        currentSortBy={undefined}
        onSortChange={mockOnSortChange}
      />
    );

    const filterButton = screen.getByRole("button", {
      name: /abrir menu de ordenação/i,
    });
    fireEvent.click(filterButton);

    expect(
      screen.getByRole("menuitem", { name: "Título" })
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(
      screen.queryByRole("menuitem", { name: "Título" })
    ).not.toBeInTheDocument();
  });
});
