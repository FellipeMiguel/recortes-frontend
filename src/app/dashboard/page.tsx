import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CutsTable } from "@/components/CutsTable";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-normal text-gray-800">Peças gerais</h1>
        <Link href="/dashboard/cuts/new">
          <button className="bg-black text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Adicionar Peça
          </button>
        </Link>
      </div>

      <CutsTable />
    </>
  );
}
