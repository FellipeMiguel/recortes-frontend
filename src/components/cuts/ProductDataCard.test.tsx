import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProductDataCard, ProductDataCardProps } from "./ProductDataCard";
import { UseFormRegister, FieldErrors, Path } from "react-hook-form";

import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page";

describe("ProductDataCard Component", () => {
  let mockRegister: jest.MockedFunction<UseFormRegister<CreateCutForm>>;
  let defaultTestProps: ProductDataCardProps;

  beforeEach(() => {
    mockRegister = jest
      .fn()
      .mockImplementation((name: Path<CreateCutForm>) => ({
        name: name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      }));

    defaultTestProps = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      register: mockRegister as unknown as UseFormRegister<any>,
      errors: {} as FieldErrors<CreateCutForm["body"]>,
      generatedKey: "",
    };
  });

  it("deve renderizar os labels e inputs corretamente", () => {
    render(<ProductDataCard {...defaultTestProps} />);

    expect(screen.getByLabelText("SKU")).toBeInTheDocument();
    const skuInput = screen.getByRole("textbox", { name: "SKU" });
    expect(skuInput).toBeInTheDocument();
    expect(skuInput).toHaveAttribute("name", "body.sku");

    expect(screen.getByText("Chave key gerada")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Chave gerada a partir da imagem salva")
    ).toBeInTheDocument();
  });

  it('deve exibir o valor "Preencha os campos..." para generatedKey quando a prop está vazia', () => {
    render(<ProductDataCard {...defaultTestProps} generatedKey="" />);
    const generatedKeyInput = screen.getByDisplayValue(
      "Preencha os campos para pré-visualizar..."
    ) as HTMLInputElement;
    expect(generatedKeyInput).toBeInTheDocument();
    expect(generatedKeyInput).toHaveAttribute(
      "placeholder",
      "Chave gerada a partir da imagem salva"
    );
  });

  it("deve exibir a prop generatedKey corretamente", () => {
    const testKey = "modelo-tipo-material-cor";
    render(<ProductDataCard {...defaultTestProps} generatedKey={testKey} />);
    const generatedKeyInput = screen.getByDisplayValue(
      testKey
    ) as HTMLInputElement;
    expect(generatedKeyInput).toBeInTheDocument();
    expect(generatedKeyInput.readOnly).toBe(true);
  });

  it("deve exibir uma mensagem de erro para SKU quando fornecida", () => {
    const skuErrorMessage = "SKU é obrigatório";
    const propsWithError: ProductDataCardProps = {
      ...defaultTestProps,
      errors: {
        sku: {
          type: "required",
          message: skuErrorMessage,
        },
      } as FieldErrors<CreateCutForm["body"]>,
    };
    render(<ProductDataCard {...propsWithError} />);
    expect(screen.getByText(skuErrorMessage)).toBeInTheDocument();
  });

  it("deve chamar a função register com o nome correto para o campo SKU", () => {
    render(<ProductDataCard {...defaultTestProps} />);
    expect(mockRegister).toHaveBeenCalledWith("body.sku");
  });
});
