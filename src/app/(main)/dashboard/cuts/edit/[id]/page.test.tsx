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
import EditCutPage from "./page";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  sanitize as actualSanitize,
  extractKeyFromImageUrl as actualExtractKey,
} from "@/utils/stringUtils";
import { Session } from "next-auth";
import { Cut } from "@/types";

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: jest.fn(),
}));

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
    back: mockRouterBack,
    prefetch: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  })),
  useParams: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
  usePathname: jest.fn(() => "/dashboard/cuts/edit/1"),
}));

global.fetch = jest.fn();

jest.mock("@/utils/stringUtils", () => ({
  __esModule: true,
  sanitize: jest.fn(),
  extractKeyFromImageUrl: jest.fn(),
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
  };
});

const typedUseSession = useSession as jest.MockedFunction<typeof useSession>;
import { sanitize, extractKeyFromImageUrl } from "@/utils/stringUtils";
const typedMockSanitize = sanitize as jest.MockedFunction<
  typeof actualSanitize
>;
const typedMockExtractKey = extractKeyFromImageUrl as jest.MockedFunction<
  typeof actualExtractKey
>;
const typedUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe("EditCutPage", () => {
  const mockSessionData: Session = {
    user: {
      idToken: "fake-token-edit",
      name: "Edit User",
      email: "edit@user.com",
    },
    expires: "some-future-date",
  };

  const mockCutId = "21";
  const mockExistingCutData: Cut = {
    id: 21,
    modelName: "Boné Edição",
    sku: "SKUEDIT",
    cutType: "aba",
    position: "Frente",
    productType: "boné americano",
    material: "linho",
    materialColor: "azul-marinho",
    displayOrder: 2,
    status: "PENDENTE",
    imageUrl:
      "http://example.com/storage/recortes/bone-edicao-aba-linho-azul-marinho.png",
    userId: "user-auth-id-123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let alertSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    typedUseSession.mockReturnValue({
      data: mockSessionData,
      status: "authenticated",
      update: function (): Promise<Session | null> {
        throw new Error("Function not implemented.");
      },
    });

    typedUseParams.mockReturnValue({ id: mockCutId });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockExistingCutData,
    });

    typedMockSanitize.mockImplementation((val: string | null | undefined) =>
      val ? val.replace(/\s+/g, "-").toLowerCase() : ""
    );
    typedMockExtractKey.mockImplementation((url: string | null | undefined) => {
      if (url && url.includes("bone-edicao-aba-linho-azul-marinho.png"))
        return "bone-edicao-aba-linho-azul-marinho";
      if (!url) return "";
      const parts = url.split("/");
      return parts[parts.length - 1].split(".")[0] || "";
    });

    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("should display loading state initially", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );
    render(<EditCutPage />);
    expect(screen.getByText(/carregando dados da peça/i)).toBeInTheDocument();
  });

  it("should fetch cut data on mount and populate the form", async () => {
    render(<EditCutPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/cuts/${mockCutId}`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockSessionData.user.idToken}` },
        })
      );
    });
    expect(
      await screen.findByDisplayValue(mockExistingCutData.modelName)
    ).toBeInTheDocument();
    const imagePreview = (await screen.findByRole("img", {
      name: /Preview/i,
    })) as HTMLImageElement;
    expect(imagePreview.src).toBe(mockExistingCutData.imageUrl);
    expect(
      await screen.findByDisplayValue("bone-edicao-aba-linho-azul-marinho")
    ).toBeInTheDocument();
  });

  it("shows UnsavedChangesBar when form is dirty after data load", async () => {
    render(<EditCutPage />);
    await screen.findByDisplayValue(mockExistingCutData.modelName);
    expect(
      screen.queryByRole("button", { name: /salvar/i })
    ).not.toBeInTheDocument();

    const modelNameInput = screen.getByLabelText(/nome do modelo/i);
    await act(async () => {
      fireEvent.change(modelNameInput, {
        target: { value: "Modelo Alterado" },
      });
    });
    expect(
      await screen.findByRole("button", { name: /salvar/i })
    ).toBeInTheDocument();
  });

  describe("Form Update Submission", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
        if (
          options?.method === "PUT" &&
          (url as string).includes(`/cuts/${mockCutId}`)
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              ...mockExistingCutData,
              modelName: "Modelo Atualizado",
            }),
          } as Response);
        }
        if (options?.method === undefined || options?.method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => mockExistingCutData,
          } as Response);
        }
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ message: "Mock não configurado" }),
        } as Response);
      });
    });

    it("should submit updated data, call PUT API, reset form, and show success", async () => {
      render(<EditCutPage />);
      await screen.findByDisplayValue(mockExistingCutData.modelName);

      const newModelName = "Modelo Super Atualizado";
      const modelNameInput = screen.getByLabelText(/nome do modelo/i);

      await act(async () => {
        fireEvent.change(modelNameInput, { target: { value: newModelName } });
      });

      const saveButton = await screen.findByRole("button", { name: /salvar/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      const putFetchCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) => call[1]?.method === "PUT"
      );
      expect(putFetchCall).toBeDefined();
      expect(putFetchCall[0]).toBe(`http://localhost:3001/cuts/${mockCutId}`);
      const formDataSent = putFetchCall[1].body as FormData;
      expect(formDataSent.get("modelName")).toBe(newModelName);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          "Recorte atualizado com sucesso!"
        );
      });
      expect(
        (screen.getByLabelText(/nome do modelo/i) as HTMLInputElement).value
      ).toBe("Modelo Atualizado");
    });
  });

  describe("Delete Functionality", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
        if (
          options?.method === "DELETE" &&
          (url as string).includes(`/cuts/${mockCutId}`)
        ) {
          return Promise.resolve({ ok: true, status: 204 } as Response);
        }
        if (options?.method === undefined || options?.method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => mockExistingCutData,
          } as Response);
        }
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ message: "Mock não configurado" }),
        } as Response);
      });
    });

    it("should call DELETE API and redirect on successful deletion after confirmation", async () => {
      confirmSpy.mockReturnValueOnce(true);
      render(<EditCutPage />);
      await screen.findByDisplayValue(mockExistingCutData.modelName);

      const deleteButton = screen.getByRole("button", {
        name: /excluir peça/i,
      });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        "Tem certeza que deseja excluir esta peça?"
      );
      const deleteFetchCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) => call[1]?.method === "DELETE"
      );
      expect(deleteFetchCall).toBeDefined();
      expect(deleteFetchCall[0]).toBe(
        `http://localhost:3001/cuts/${mockCutId}`
      );

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          "Recorte excluído com sucesso!"
        );
      });
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should not call DELETE API if confirmation is cancelled", async () => {
      confirmSpy.mockReturnValueOnce(false);
      render(<EditCutPage />);
      await screen.findByDisplayValue(mockExistingCutData.modelName);

      const deleteButton = screen.getByRole("button", {
        name: /excluir peça/i,
      });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(window.confirm).toHaveBeenCalledTimes(1);
      const deleteFetchCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) => call[1]?.method === "DELETE"
      );
      expect(deleteFetchCall).toBeUndefined();
    });
  });

  it("should discard changes and reset form to original loaded data", async () => {
    render(<EditCutPage />);
    await screen.findByDisplayValue(mockExistingCutData.modelName);

    const modelNameInput = screen.getByLabelText(
      /nome do modelo/i
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(modelNameInput, {
        target: { value: "Nome Muito Diferente" },
      });
    });
    expect(modelNameInput.value).toBe("Nome Muito Diferente");

    const discardButton = await screen.findByRole("button", {
      name: /descartar/i,
    });
    await act(async () => {
      fireEvent.click(discardButton);
    });

    expect(modelNameInput.value).toBe(mockExistingCutData.modelName);
    expect(
      screen.queryByRole("button", { name: /salvar/i })
    ).not.toBeInTheDocument();
  });
});
