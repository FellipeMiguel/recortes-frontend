"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Cut, CutsApiResponseMeta } from "@/types";
import Link from "next/link";
import { extractKeyFromImageUrl } from "@/utils/stringUtils";
import { FilterDropdown } from "../FilterDropdown";
import { StatusPill } from "@/components/ui/StatusPill";

interface VisualizationTableProps {
  cuts: Cut[];
  paginationMeta: CutsApiResponseMeta;
  currentSortBy?: string;
}

export function VisualizationTable({
  cuts: originalCuts,
  paginationMeta,
  currentSortBy,
}: VisualizationTableProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const {
    page: currentPage,
    totalPages,
    total: totalBackendItems,
  } = paginationMeta;
  const REQUIRED_SELECTIONS = 3;

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

  const handleSelectCut = (cutId: number) => {
    setSelectedIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(cutId)) {
        newSelectedIds.delete(cutId);
      } else {
        if (newSelectedIds.size < REQUIRED_SELECTIONS) {
          newSelectedIds.add(cutId);
        } else {
          alert(
            `Você deve selecionar ${REQUIRED_SELECTIONS} peças. Desmarque uma para selecionar outra, ou limpe a seleção.`
          );
        }
      }
      return newSelectedIds;
    });
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

  const handleGenerateImage = () => {
    if (selectedIds.size !== REQUIRED_SELECTIONS) {
      alert(
        `Por favor, selecione exatamente ${REQUIRED_SELECTIONS} peças para gerar a imagem.`
      );
      return;
    }
    console.log("IDs selecionados para gerar imagem:", Array.from(selectedIds));
    alert(
      `Próxima etapa: Ir para página de montagem com ${selectedIds.size} peça(s) selecionada(s).`
    );
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (sortByValue?: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    if (sortByValue) {
      params.set("sortBy", sortByValue);
    } else {
      params.delete("sortBy");
    }
    params.set("page", "1");
    router.push(`/visualizacao?${params.toString()}`);
  };

  if (originalCuts === undefined || originalCuts === null) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
        Carregando...
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Termo de busca submetido (frontend):", searchTerm);
  };

  const buildPageLinkParams = (pageNumber: number) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("page", String(pageNumber));
    return params.toString();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-x-6 text-sm text-gray-500 border-b sm:border-b-0 pb-3 sm:pb-0">
            <button className="py-2 text-gray-700 hover:text-purple-600">
              Todos ({searchTerm ? displayedCuts.length : totalBackendItems})
            </button>
            <button className="py-2 border-b-2 border-purple-600 text-purple-600 font-semibold">
              Ativos ({displayedCuts.filter((c) => c.status === "ATIVO").length}
              )
            </button>
            <button className="py-2 text-gray-700 hover:text-purple-600">
              Expirado (0)
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="w-full sm:w-56 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none h-10"
              />
              <button
                type="submit"
                title="Pesquisar"
                className="bg-black text-white p-0 w-10 h-10 flex items-center justify-center rounded-r-lg hover:bg-gray-800 transition-colors"
              >
                <Image src="/lupa.svg" alt="Pesquisar" width={20} height={20} />
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
                  <th className="px-6 py-3 text-left w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
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
                  <tr key={cut.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={selectedIds.has(cut.id)}
                        onChange={() => handleSelectCut(cut.id)}
                        disabled={
                          selectedIds.size >= REQUIRED_SELECTIONS &&
                          !selectedIds.has(cut.id)
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {extractKeyFromImageUrl(cut.imageUrl)}
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
            {searchTerm && `para a busca "${searchTerm}"`}.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {(totalPages >= 1 &&
          displayedCuts.length > 0 &&
          totalBackendItems > 0) ||
        (totalPages > 1 && totalBackendItems > 0) ? (
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <Link
              href={`/visualizacao?${buildPageLinkParams(currentPage - 1)}`}
              className={`px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={currentPage === 1}
            >
              &lt;
            </Link>
            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/visualizacao?${buildPageLinkParams(pageNumber)}`}
                className={`px-3 py-2 text-sm rounded-md border hover:bg-gray-50 ${
                  currentPage === pageNumber
                    ? "text-white bg-black border-black font-bold"
                    : "text-gray-500 bg-white border-gray-300"
                }`}
              >
                {pageNumber}
              </Link>
            ))}
            <Link
              href={`/visualizacao?${buildPageLinkParams(currentPage + 1)}`}
              className={`px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 ${
                currentPage === totalPages || totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
              aria-disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </Link>
          </nav>
        ) : (
          <div className="h-[38px]" />
        )}
        <div
          className={
            (totalPages > 1 ||
              (displayedCuts.length === 0 && totalPages > 0)) &&
            totalBackendItems > 0
              ? ""
              : "w-full flex justify-end"
          }
        >
          <button
            onClick={handleGenerateImage}
            disabled={selectedIds.size !== REQUIRED_SELECTIONS}
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            GERAR IMAGEM ({selectedIds.size})
          </button>
        </div>
      </div>
    </>
  );
}
