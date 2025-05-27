import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MediaCard, MediaCardProps } from "./MediaCard";
import {
  UseFormRegister,
  FieldErrors,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page";

jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  UploadCloud: () => <svg data-testid="upload-cloud-icon" />,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("MediaCard Component", () => {
  let mockRegister: jest.MockedFunction<UseFormRegister<CreateCutForm>>;
  let mockOnImageChange: jest.Mock;
  let defaultTestProps: MediaCardProps;

  beforeEach(() => {
    mockOnImageChange = jest.fn();

    mockRegister = jest
      .fn()
      .mockImplementation(
        (
          name: Path<CreateCutForm>,
          options?: RegisterOptions<CreateCutForm, Path<CreateCutForm>>
        ) => {
          return {
            name: name,
            onChange: options?.onChange || jest.fn(),
            onBlur: options?.onBlur || jest.fn(),
            ref: jest.fn(),
          };
        }
      );

    defaultTestProps = {
      register: mockRegister,
      errors: {} as FieldErrors<CreateCutForm>,
      imagePreview: null,
      onImageChange: mockOnImageChange,
    };
  });

  it("deve renderizar o estado inicial corretamente sem preview de imagem", () => {
    render(<MediaCard {...defaultTestProps} />);

    expect(screen.getByText(/clique para enviar/i)).toBeInTheDocument();
    expect(screen.getByTestId("upload-cloud-icon")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload-input")).toBeInTheDocument();
  });

  it("deve exibir o preview da imagem quando imagePreview é fornecido", () => {
    const previewUrl = "data:image/png;base64,mockimagecontent";
    render(<MediaCard {...defaultTestProps} imagePreview={previewUrl} />);

    const imageElement = screen.getByRole("img", {
      name: /preview/i,
    }) as HTMLImageElement;
    expect(imageElement).toBeInTheDocument();
    expect(imageElement.src).toBe(previewUrl);
    expect(screen.queryByText("Preview")).not.toBeInTheDocument();
  });

  it("deve chamar onImageChange (a prop do componente) quando um arquivo é selecionado", () => {
    render(<MediaCard {...defaultTestProps} />);

    const fileInput = screen.getByTestId("image-upload-input");
    const testFile = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    expect(mockOnImageChange).toHaveBeenCalledTimes(1);
    expect(mockOnImageChange.mock.calls[0][0].target.files[0]).toBe(testFile);
  });

  it("deve exibir uma mensagem de erro para o campo de arquivo quando fornecida", () => {
    const fileErrorMessage = "A imagem é obrigatória.";
    const propsWithError: MediaCardProps = {
      ...defaultTestProps,
      errors: {
        file: {
          type: "required",
          message: fileErrorMessage,
        },
      } as FieldErrors<CreateCutForm>,
    };
    render(<MediaCard {...propsWithError} />);

    expect(screen.getByText(fileErrorMessage)).toBeInTheDocument();
  });

  it("deve registrar o campo de arquivo corretamente com react-hook-form", () => {
    render(<MediaCard {...defaultTestProps} />);

    expect(mockRegister).toHaveBeenCalledWith(
      "file",
      expect.objectContaining({
        onChange: defaultTestProps.onImageChange,
      })
    );

    const fileInput = screen.getByTestId("image-upload-input");
    expect(fileInput).toHaveAttribute("name", "file");
  });
});
