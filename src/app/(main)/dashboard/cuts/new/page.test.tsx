"use client";

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import NewCutPage from "./page";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { sanitize } from "@/utils/stringUtils";

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: jest.fn(),
}));

const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockRouterPush,
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  useParams: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

global.fetch = jest.fn();

jest.mock("@/utils/stringUtils", () => ({
  __esModule: true,
  sanitize: jest.fn((val) =>
    val ? val.replace(/\s+/g, "-").toLowerCase() : ""
  ),
  extractKeyFromImageUrl: jest.fn((val) => val || ""),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    const { src, alt, width, height, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src as string}
        alt={alt as string}
        width={width as number}
        height={height as number}
        {...rest}
      />
    );
  },
}));

jest.mock("lucide-react", () => {
  const original = jest.requireActual("lucide-react");
  return {
    ...original,
    ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
    UploadCloud: () => <svg data-testid="upload-cloud-icon" />,
    Info: () => <svg data-testid="info-icon" />,
  };
});

const typedUseSession = useSession as jest.MockedFunction<typeof useSession>;
const typedMockSanitize = sanitize as jest.MockedFunction<typeof sanitize>;

describe("NewCutPage", () => {
  const mockSessionData: Session = {
    user: { idToken: "fake-token", name: "Test User", email: "test@user.com" },
    expires: "some-future-date",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    typedUseSession.mockReturnValue({
      data: mockSessionData,
      status: "authenticated",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      update: function (data?: any): Promise<Session | null> {
        throw new Error("Function not implemented.");
      },
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, message: "Success" }),
    });

    typedMockSanitize.mockImplementation((val: string | null | undefined) =>
      val ? val.replace(/\s+/g, "-").toLowerCase() : ""
    );

    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
  });

  it("renders all main sections and form fields correctly", () => {
    render(<NewCutPage />);
    expect(
      screen.getByRole("heading", { name: /nova peça/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nome do modelo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo do recorte/i)).toBeInTheDocument();
    expect(screen.getByText(/clique para enviar/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/chave gerada a partir da imagem salva/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /salvar/i })
    ).not.toBeInTheDocument();
  });

  it("shows UnsavedChangesBar when form is dirty", async () => {
    render(<NewCutPage />);
    expect(
      screen.queryByRole("button", { name: /salvar/i })
    ).not.toBeInTheDocument();
    const modelNameInput = screen.getByLabelText(/nome do modelo/i);
    await act(async () => {
      fireEvent.change(modelNameInput, { target: { value: "Test Model" } });
    });
    expect(
      await screen.findByRole("button", { name: /salvar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /descartar/i })
    ).toBeInTheDocument();
  });

  it("shows alert if image is not provided on submit", async () => {
    render(<NewCutPage />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/nome do modelo/i), {
        target: { value: "Test Model" },
      });
      fireEvent.change(screen.getByLabelText(/sku/i), {
        target: { value: "SKU123" },
      });
      fireEvent.change(screen.getByLabelText(/tipo do recorte/i), {
        target: { value: "aba" },
      });
      fireEvent.change(screen.getByLabelText(/posição da imagem/i), {
        target: { value: "Frente" },
      });
      fireEvent.change(screen.getByLabelText(/tipo de produto/i), {
        target: { value: "boné americano" },
      });
      // CORREÇÃO AQUI: Usando regex mais específica para "Material"
      fireEvent.change(screen.getByLabelText(/^Material$/i), {
        target: { value: "algodão" },
      });
      fireEvent.change(screen.getByLabelText(/ordem de exibição/i), {
        target: { value: "1" },
      });
    });

    const saveButton = await screen.findByRole("button", { name: /salvar/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("A imagem é obrigatória.");
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("discards changes when discard button is clicked", async () => {
    render(<NewCutPage />);
    const modelNameInput = screen.getByLabelText(
      /nome do modelo/i
    ) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(modelNameInput, {
        target: { value: "Modelo Teste Sujo" },
      });
    });

    const discardButton = await screen.findByRole("button", {
      name: /descartar/i,
    });
    await act(async () => {
      fireEvent.click(discardButton);
    });

    expect(modelNameInput.value).toBe("");
    expect(
      screen.queryByRole("button", { name: /salvar/i })
    ).not.toBeInTheDocument();
  });
});
