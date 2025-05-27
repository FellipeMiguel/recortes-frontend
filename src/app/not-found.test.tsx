import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotFoundPage from "./not-found";

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  FileQuestion: () => <svg data-testid="file-question-icon" />,
}));

describe("NotFoundPage Component", () => {
  it("should render all key text elements correctly", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole("heading", { name: /404/i, level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /página não encontrada/i, level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Oops! Parece que a página que você está procurando não existe ou foi movida./i
      )
    ).toBeInTheDocument();
  });

  it("should render the icon", () => {
    render(<NotFoundPage />);
    expect(screen.getByTestId("file-question-icon")).toBeInTheDocument();
  });

  it('should render the "Voltar para a Página Inicial" link with correct href', () => {
    render(<NotFoundPage />);

    const homeLink = screen.getByRole("link", {
      name: /voltar para a página inicial/i,
    });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/dashboard");
  });

  it("should have appropriate styling classes for the main container", () => {
    const { container } = render(<NotFoundPage />);
    const mainDiv = container.firstChild;

    expect(mainDiv).toHaveClass("flex");
    expect(mainDiv).toHaveClass("flex-col");
    expect(mainDiv).toHaveClass("items-center");
    expect(mainDiv).toHaveClass("justify-center");
    expect(mainDiv).toHaveClass("min-h-screen");
    expect(mainDiv).toHaveClass("bg-gray-100");
  });
});
