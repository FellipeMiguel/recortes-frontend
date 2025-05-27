import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <FileQuestion
        className="w-24 h-24 text-purple-400 mb-8"
        strokeWidth={1}
      />

      <h1 className="text-6xl font-bold text-purple-600">404</h1>
      <h2 className="mt-4 text-3xl font-semibold text-gray-800">
        Página Não Encontrada
      </h2>
      <p className="mt-2 text-md text-gray-600">
        Oops! Parece que a página que você está procurando não existe ou foi
        movida.
      </p>

      <div className="mt-10">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-150 ease-in-out"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}
