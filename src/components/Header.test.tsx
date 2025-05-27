import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Header } from "./Header";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("Header Component", () => {
  it("should render the logo correctly with expected attributes", () => {
    render(<Header />);

    const logoImage = screen.getByAltText("Logo do Fanation");

    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/fanation_logo_header.svg");
    expect(logoImage).toHaveAttribute("width", "120");
    expect(logoImage).toHaveAttribute("height", "40");
  });

  it("should have correct style and responsiveness classes applied to the header element", () => {
    const { container } = render(<Header />);
    const headerElement = container.firstChild;

    expect(headerElement).toHaveClass("hidden");
    expect(headerElement).toHaveClass("sm:flex");
    expect(headerElement).toHaveClass("items-center");
    expect(headerElement).toHaveClass("justify-between");
    expect(headerElement).toHaveClass("px-6");
    expect(headerElement).toHaveClass("py-4");
    expect(headerElement).toHaveClass("bg-[#440986]");
    expect(headerElement).toHaveClass("text-white");
  });
});
