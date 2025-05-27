import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  SpecificationsCard,
  SpecificationsCardProps,
} from "./SpecificationsCard";
import { UseFormRegister, FieldErrors, Path } from "react-hook-form";
import { CreateCutForm } from "@/app/(main)/dashboard/cuts/new/page"; // Ajuste o caminho se necessário

describe("SpecificationsCard Component", () => {
  let mockRegister: jest.MockedFunction<UseFormRegister<CreateCutForm>>;
  let defaultTestProps: SpecificationsCardProps;

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
      register: mockRegister,
      errors: {} as FieldErrors<CreateCutForm["body"]>,
    };
  });

  it("deve renderizar todos os labels e campos do formulário corretamente", () => {
    render(<SpecificationsCard {...defaultTestProps} />);

    expect(
      screen.getByRole("textbox", { name: /nome do modelo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /tipo do recorte/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /posição da imagem/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /tipo de produto/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /^Material$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /cor do material/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /ordem de exibição/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar as opções corretas nos campos de seleção", () => {
    render(<SpecificationsCard {...defaultTestProps} />);

    const cutTypeSelect = screen.getByRole("combobox", {
      name: /tipo do recorte/i,
    });
    expect(
      within(cutTypeSelect).getByRole("option", { name: "Selecionar..." })
    ).toBeInTheDocument();
    expect(
      within(cutTypeSelect).getByRole("option", { name: "aba" })
    ).toBeInTheDocument();

    const positionSelect = screen.getByRole("combobox", {
      name: /posição da imagem/i,
    });
    expect(
      within(positionSelect).getByRole("option", { name: "Selecionar..." })
    ).toBeInTheDocument();
    expect(
      within(positionSelect).getByRole("option", { name: "Frente" })
    ).toBeInTheDocument();

    const productTypeSelect = screen.getByRole("combobox", {
      name: /tipo de produto/i,
    });
    expect(
      within(productTypeSelect).getByRole("option", { name: "Selecionar..." })
    ).toBeInTheDocument();
    expect(
      within(productTypeSelect).getByRole("option", { name: "boné americano" })
    ).toBeInTheDocument();

    const materialSelect = screen.getByRole("combobox", {
      name: /^Material$/i,
    });
    expect(
      within(materialSelect).getByRole("option", { name: "Selecionar..." })
    ).toBeInTheDocument();
    expect(
      within(materialSelect).getByRole("option", { name: "algodão" })
    ).toBeInTheDocument();
    expect(
      within(materialSelect).getByRole("option", { name: "linho" })
    ).toBeInTheDocument();

    const materialColorSelect = screen.getByRole("combobox", {
      name: /cor do material/i,
    });
    expect(
      within(materialColorSelect).getByRole("option", { name: "Selecionar..." })
    ).toBeInTheDocument();
    expect(
      within(materialColorSelect).getByRole("option", { name: "Azul marinho" })
    ).toBeInTheDocument();
    expect(
      within(materialColorSelect).getByRole("option", { name: "Laranja" })
    ).toBeInTheDocument();
  });

  it("deve exibir mensagens de erro quando fornecidas nas props", () => {
    const modelNameErrorMsg = "Nome do modelo é muito curto";
    const cutTypeErrorMsg = "Selecione um tipo de recorte";

    const propsWithError: SpecificationsCardProps = {
      ...defaultTestProps,
      errors: {
        modelName: { type: "minLength", message: modelNameErrorMsg },
        cutType: { type: "required", message: cutTypeErrorMsg },
      } as FieldErrors<CreateCutForm["body"]>,
    };
    render(<SpecificationsCard {...propsWithError} />);

    expect(screen.getByText(modelNameErrorMsg)).toBeInTheDocument();
    expect(screen.getByText(cutTypeErrorMsg)).toBeInTheDocument();
  });

  it("deve chamar a função register para todos os campos", () => {
    render(<SpecificationsCard {...defaultTestProps} />);

    expect(mockRegister).toHaveBeenCalledWith("body.modelName");
    expect(mockRegister).toHaveBeenCalledWith("body.cutType");
    expect(mockRegister).toHaveBeenCalledWith("body.position");
    expect(mockRegister).toHaveBeenCalledWith("body.productType");
    expect(mockRegister).toHaveBeenCalledWith("body.material");
    expect(mockRegister).toHaveBeenCalledWith("body.materialColor");
    expect(mockRegister).toHaveBeenCalledWith("body.displayOrder");
  });
});
