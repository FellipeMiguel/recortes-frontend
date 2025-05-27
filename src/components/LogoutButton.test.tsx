import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LogoutButton } from "./LogoutButton";
import { signOut } from "next-auth/react";

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  signOut: jest.fn(),
}));

describe("LogoutButton Component", () => {
  beforeEach(() => {
    (signOut as jest.Mock).mockClear();
  });

  it("should render the logout button correctly", () => {
    render(<LogoutButton />);

    const buttonElement = screen.getByRole("button", { name: /sair/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent("Sair");
  });

  it("should call the signOut function with the correct callbackUrl when clicked", () => {
    render(<LogoutButton />);

    const buttonElement = screen.getByRole("button", { name: /sair/i });
    fireEvent.click(buttonElement);

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("should have the expected style classes", () => {
    render(<LogoutButton />);
    const buttonElement = screen.getByRole("button", { name: /sair/i });

    expect(buttonElement).toHaveClass("bg-[#070707]");
    expect(buttonElement).toHaveClass("text-white");
    expect(buttonElement).toHaveClass("rounded-lg");
  });
});
