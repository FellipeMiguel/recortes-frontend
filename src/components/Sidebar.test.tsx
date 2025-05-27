import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

jest.mock("./LogoutButton", () => ({
  LogoutButton: () => <button>Sair Mocked</button>,
}));

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  X: () => <svg data-testid="x-icon" />,
}));

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

describe("Sidebar Component", () => {
  const mockOnCloseMobile = jest.fn();

  const navLinksExpected = [
    { name: "Peças", href: "/dashboard" },
    { name: "Visualização", href: "/visualization" },
    { name: "Clientes", href: "/clientes" },
  ];

  beforeEach(() => {
    mockOnCloseMobile.mockClear();
    mockUsePathname.mockReturnValue("/some-default-path");
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("should render all navigation links correctly", () => {
    render(<Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />);

    navLinksExpected.forEach((link) => {
      const linkElement = screen.getByRole("link", { name: link.name });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", link.href);
    });
  });

  it("should render the LogoutButton", () => {
    render(<Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />);
    expect(
      screen.getByRole("button", { name: /sair mocked/i })
    ).toBeInTheDocument();
  });

  describe("Active Link Styling", () => {
    it("should apply active style for /dashboard", () => {
      mockUsePathname.mockReturnValue("/dashboard");
      render(
        <Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />
      );
      const pecasLink = screen.getByRole("link", { name: "Peças" });
      expect(pecasLink).toHaveClass("bg-[#5A00B4]", "text-white");
    });

    it("should apply active style for /dashboard/cuts sub-route", () => {
      mockUsePathname.mockReturnValue("/dashboard/cuts/new");
      render(
        <Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />
      );
      const pecasLink = screen.getByRole("link", { name: "Peças" });
      expect(pecasLink).toHaveClass("bg-[#5A00B4]", "text-white");
    });

    it("should apply active style for /visualization", () => {
      mockUsePathname.mockReturnValue("/visualization");
      render(
        <Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />
      );
      const visualizacaoLink = screen.getByRole("link", {
        name: "Visualização",
      });
      expect(visualizacaoLink).toHaveClass("bg-[#5A00B4]", "text-white");
    });

    it("should not apply active style for a non-matching link", () => {
      mockUsePathname.mockReturnValue("/some-other-page");
      render(
        <Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />
      );
      const pecasLink = screen.getByRole("link", { name: "Peças" });
      expect(pecasLink).not.toHaveClass("bg-[#5A00B4]", "text-white");
    });
  });

  describe("Mobile Behavior", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should be hidden by default on mobile (checking transform class)", () => {
      render(
        <Sidebar isMobileOpen={false} onCloseMobile={mockOnCloseMobile} />
      );
      const asideElement = screen.getByRole("complementary");
      expect(asideElement).toHaveClass("-translate-x-full");
      expect(asideElement).not.toHaveClass("translate-x-0");
    });

    it("should be visible on mobile when isMobileOpen is true", () => {
      render(<Sidebar isMobileOpen={true} onCloseMobile={mockOnCloseMobile} />);
      const asideElement = screen.getByRole("complementary");
      expect(asideElement).toHaveClass("translate-x-0");
      expect(asideElement).not.toHaveClass("-translate-x-full");
    });

    it("should show the close button on mobile when open", () => {
      render(<Sidebar isMobileOpen={true} onCloseMobile={mockOnCloseMobile} />);
      expect(
        screen.getByRole("button", { name: /fechar menu/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("should call onCloseMobile when the close button is clicked", () => {
      render(<Sidebar isMobileOpen={true} onCloseMobile={mockOnCloseMobile} />);
      const closeButton = screen.getByRole("button", { name: /fechar menu/i });
      fireEvent.click(closeButton);
      expect(mockOnCloseMobile).toHaveBeenCalledTimes(1);
    });

    it("should call onCloseMobile when a navigation link is clicked in mobile mode", () => {
      render(<Sidebar isMobileOpen={true} onCloseMobile={mockOnCloseMobile} />);
      const pecasLink = screen.getByRole("link", { name: "Peças" });
      fireEvent.click(pecasLink);
      expect(mockOnCloseMobile).toHaveBeenCalledTimes(1);
    });

    it("should call onCloseMobile when the backdrop is clicked", () => {
      render(<Sidebar isMobileOpen={true} onCloseMobile={mockOnCloseMobile} />);
      const backdrop = screen.getByTestId("sidebar-backdrop");
      fireEvent.click(backdrop);
      expect(mockOnCloseMobile).toHaveBeenCalledTimes(1);
    });
  });
});
