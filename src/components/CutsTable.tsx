import React from "react";
import Image from "next/image";
import { FilterDropdown } from "./FilterDropdown";

const mockCuts = [
  {
    titulo: "Aba-frente-americano-linho-azul_marinho",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Aba-frente-americano-linho-azul_marinho",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Aba-frente-americano-linho-azul_marinho",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
  {
    titulo: "Modelo São Paulo",
    sku: "#123",
    tipo: "Americano",
    ordemExibicao: "05",
    status: "Ativo",
  },
];

const StatusPill = ({ status }: { status: string }) => {
  if (status === "-") {
    return (
      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#EAF7ED] text-[#2F843F]">
        Ativo
      </span>
    );
  }
  return (
    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
      {status}
    </span>
  );
};

export function CutsTable() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <button className="pb-2">Todos (000)</button>
          <button className="pb-2 border-b-2 border-[#5A00B4] text-[#5A00B4] font-semibold">
            Ativos (0)
          </button>
          <button className="pb-2">Expirado (0)</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full sm:w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A00B4]"
            />
            <button className="absolute inset-y-0 right-0 flex items-center p-5 text-gray-500 bg-black rounded">
              <Image
                src="/lupa.svg"
                alt="Lupa para pesquisa"
                width={15}
                height={15}
              />
            </button>
          </div>
          <FilterDropdown />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordem de exibição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockCuts.map((cut, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cut.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cut.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cut.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cut.ordemExibicao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusPill status={cut.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center mt-6">
        <nav className="flex items-center gap-2" aria-label="Pagination">
          <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
            &lt;
          </button>
          <button className="px-3 py-1 rounded-md text-white bg-black font-bold">
            1
          </button>
          <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
            2
          </button>
          <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
            3
          </button>
          <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
            4
          </button>
          <button className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">
            &gt;
          </button>
        </nav>
      </div>
    </div>
  );
}
