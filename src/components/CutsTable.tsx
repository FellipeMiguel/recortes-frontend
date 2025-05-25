"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown } from "./FilterDropdown";
import { StatusPill } from "@/components/ui/StatusPill";
import { Cut, CutsApiResponseMeta } from "@/types";
import Link from "next/link";
import Image from "next/image";
interface CutsTableProps {
  cuts: Cut[];
  paginationMeta: CutsApiResponseMeta;
  currentSortBy?: string;
}

export function CutsTable({
  cuts: originalCuts,
  paginationMeta,
  currentSortBy,
}: CutsTableProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const {
    page: currentPage,
    totalPages,
    total: totalBackendItems,
  } = paginationMeta;

  const displayedCuts = useMemo(() => {
    if (!searchTerm.trim()) {
      return originalCuts;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return originalCuts.filter(
      (cut) =>
        cut.modelName.toLowerCase().includes(lowerSearchTerm) ||
        cut.sku.toLowerCase().includes(lowerSearchTerm)
    );
  }, [originalCuts, searchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    console.log("Busca (Dashboard) acionada com termo:", searchTerm);
  };

  const handleSortChange = (sortByValue?: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    if (sortByValue) {
      params.set("sortBy", sortByValue);
    } else {
      params.delete("sortBy");
    }
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  const pageNumbers: number[] = [];
  const maxButtonsToShow = 4;
  if (totalPages <= maxButtonsToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage - 2);
    if (startPage + maxButtonsToShow - 1 > totalPages) {
      startPage = totalPages - maxButtonsToShow + 1;
    }
    for (let i = 0; i < maxButtonsToShow; i++) {
      pageNumbers.push(startPage + i);
    }
  }

  const handleRowClick = (cutId: number) => {
    router.push(`/dashboard/cuts/edit/${cutId}`);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button className="pb-2">Todos ({totalBackendItems})</button>
            <button className="pb-2 border-b-2 border-[#5A00B4] text-[#5A00B4] font-semibold">
              Ativos ({originalCuts.filter((c) => c.status === "ATIVO").length})
            </button>
            <button className="pb-2">Expirado (0)</button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-grow sm:flex-grow-0"
            >
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="w-full sm:w-64 h-10 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                title="Pesquisar"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-10 bg-black text-white rounded-r-lg hover:bg-gray-800 transition-colors"
              >
                <Image src="/lupa.svg" alt="Pesquisar" width={18} height={18} />
              </button>
            </form>

            <FilterDropdown
              currentSortBy={currentSortBy}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {displayedCuts.length > 0 ? (
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
                    Tipo de Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedCuts.map((cut) => (
                  <tr
                    key={cut.id}
                    onClick={() => handleRowClick(cut.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cut.modelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cut.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cut.productType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cut.displayOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusPill status={cut.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Nenhuma peça encontrada{" "}
            {searchTerm && `para a busca "${searchTerm}" `}nesta página.
          </div>
        )}
      </div>

      {totalPages >= 1 && (
        <div className="flex justify-center items-center mt-6">
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <Link
              href={`/dashboard?${new URLSearchParams({
                ...Object.fromEntries(searchParamsHook),
                page: String(currentPage - 1),
              })}`}
              className={`px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={currentPage === 1}
            >
              &lt;
            </Link>
            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/dashboard?${new URLSearchParams({
                  ...Object.fromEntries(searchParamsHook),
                  page: String(pageNumber),
                })}`}
                className={`px-3 py-1 rounded-md hover:bg-gray-100 ${
                  currentPage === pageNumber
                    ? "text-white bg-black font-bold"
                    : "text-gray-500"
                }`}
              >
                {pageNumber}
              </Link>
            ))}
            <Link
              href={`/dashboard?${new URLSearchParams({
                ...Object.fromEntries(searchParamsHook),
                page: String(currentPage + 1),
              })}`}
              className={`px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 ${
                currentPage === totalPages || totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              aria-disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
