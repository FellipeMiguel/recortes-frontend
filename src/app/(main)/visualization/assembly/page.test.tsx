"use client";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageAssemblyPage from "./page";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import {
  extractKeyFromImageUrl as actualExtractKey,
  extractKeyFromImageUrl,
} from "@/utils/stringUtils";

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: jest.fn(),
}));

const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
const mockUseParamsReturn = {};
const mockSearchParamsGet = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    back: mockRouterBack,
    push: mockRouterPush,
    prefetch: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  useParams: () => mockUseParamsReturn,
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
  Link: jest.fn(
    ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href}>{children}</a>
    )
  ),
}));

global.fetch = jest.fn();

jest.mock("@/utils/stringUtils", () => ({
  __esModule: true,
  extractKeyFromImageUrl: jest.fn(),
  sanitize: jest.fn((val) => val || ""),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} {...rest} />;
  },
}));

jest.mock("lucide-react", () => ({
  __esModule: true,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}));

const typedUseSession = useSession as jest.MockedFunction<typeof useSession>;
const typedMockExtractKey = extractKeyFromImageUrl as jest.MockedFunction<
  typeof actualExtractKey
>;

const mockSessionData: Session = {
  user: {
    idToken: "fake-token-assembly",
    name: "Assembly User",
    email: "assembly@user.com",
  },
  expires: "some-future-date",
};

describe("ImageAssemblyPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    typedUseSession.mockReturnValue({
      data: mockSessionData,
      status: "authenticated",
      update: function (): Promise<Session | null> {
        throw new Error("Function not implemented.");
      },
    });
    typedMockExtractKey.mockImplementation((url: string | null | undefined) => {
      if (!url) return "key_invalida";
      if (url.includes("frente.png")) return "frente-key";
      if (url.includes("aba.png")) return "aba-key";
      if (url.includes("lateral.png")) return "lateral-key";
      return "key_desconhecida";
    });
  });

  it("should display loading state initially", () => {
    mockSearchParamsGet.mockReturnValue("1,2,3");
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<ImageAssemblyPage />);
    expect(screen.getByText(/carregando montagem.../i)).toBeInTheDocument();
  });

  it("should display error if no IDs are provided in URL", async () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<ImageAssemblyPage />);
    expect(
      await screen.findByText(/nenhuma peça selecionada para montagem/i)
    ).toBeInTheDocument();
  });

  it("should display error if incorrect number of IDs are provided", async () => {
    mockSearchParamsGet.mockReturnValue("1,2");
    render(<ImageAssemblyPage />);
    expect(
      await screen.findByText(
        /número inválido de peças selecionadas \(2\). são necessárias exatamente 3./i
      )
    ).toBeInTheDocument();
  });
});
