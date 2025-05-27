import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../page";
import { signIn } from "next-auth/react";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  signIn: jest.fn(),
}));

describe("Login Page", () => {
  beforeEach(() => {
    (signIn as jest.Mock).mockClear();
  });

  it("should render all static elements correctly", () => {
    render(<LoginPage />);

    expect(screen.getByAltText("Logo do Fanation")).toBeInTheDocument();
    expect(screen.getByAltText("Logo do Fanation")).toHaveAttribute(
      "src",
      "/fanation_logo_login.svg"
    );

    expect(
      screen.getByRole("heading", { name: /bem-vindo ao fanation/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/acesse a sua conta para iniciar/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /entrar com google/i })
    ).toBeInTheDocument();
  });

  it('should call signIn with "google" and callbackUrl when Google login button is clicked', () => {
    render(<LoginPage />);

    const googleLoginButton = screen.getByRole("button", {
      name: /entrar com google/i,
    });
    fireEvent.click(googleLoginButton);

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/dashboard",
    });
  });
});
