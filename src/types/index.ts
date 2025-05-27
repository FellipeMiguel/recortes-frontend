export type RecorteStatus = "ATIVO" | "EXPIRADO" | "PENDENTE";

export interface Cut {
  id: number;
  sku: string;
  modelName: string;
  cutType: string;
  position: string;
  productType: string;
  material: string;
  materialColor: string | null;
  displayOrder: number;
  imageUrl: string;
  status: RecorteStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CutsApiResponseMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CutsApiResponse {
  data: Cut[];
  meta: CutsApiResponseMeta;
}
