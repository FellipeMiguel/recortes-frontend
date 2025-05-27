import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatusPill } from "./StatusPill";
import { RecorteStatus } from "@/types";

describe("StatusPill Component", () => {
  it("should render the ATIVO status correctly with the expected styles", () => {
    render(<StatusPill status="ATIVO" />);

    const pillElement = screen.getByText("Ativo");
    expect(pillElement).toBeInTheDocument();
    expect(pillElement).toHaveClass("bg-[#EAF7ED]");
    expect(pillElement).toHaveClass("text-[#2F843F]");
    expect(pillElement).toHaveClass(
      "px-3",
      "py-1",
      "inline-flex",
      "text-xs",
      "leading-5",
      "font-semibold",
      "rounded-full"
    );
  });

  it("should render the EXPIRADO status correctly with the expected styles", () => {
    render(<StatusPill status="EXPIRADO" />);

    const pillElement = screen.getByText("Expirado");
    expect(pillElement).toBeInTheDocument();
    expect(pillElement).toHaveClass("bg-red-100");
    expect(pillElement).toHaveClass("text-red-800");
    expect(pillElement).toHaveClass(
      "px-3",
      "py-1",
      "inline-flex",
      "text-xs",
      "leading-5",
      "font-semibold",
      "rounded-full"
    );
  });

  it("should render the PENDENTE status correctly with the expected styles", () => {
    render(<StatusPill status="PENDENTE" />);

    const pillElement = screen.getByText("Pendente");
    expect(pillElement).toBeInTheDocument();
    expect(pillElement).toHaveClass("bg-yellow-100");
    expect(pillElement).toHaveClass("text-yellow-800");
    expect(pillElement).toHaveClass(
      "px-3",
      "py-1",
      "inline-flex",
      "text-xs",
      "leading-5",
      "font-semibold",
      "rounded-full"
    );
  });

  it("should render an unknown status with default styles and display the status value", () => {
    const unknownStatus = "DESCONHECIDO" as RecorteStatus;
    render(<StatusPill status={unknownStatus} />);

    const pillElement = screen.getByText("DESCONHECIDO");
    expect(pillElement).toBeInTheDocument();
    expect(pillElement).toHaveClass("bg-gray-100");
    expect(pillElement).toHaveClass("text-gray-800");
    expect(pillElement).toHaveClass(
      "px-3",
      "py-1",
      "inline-flex",
      "text-xs",
      "leading-5",
      "font-semibold",
      "rounded-full"
    );
  });
});
