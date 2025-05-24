import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export const Sidebar = () => {
  return (
    <aside className="flex flex-col justify-between w-64 bg-[#F2F2F7] text-[#2C2C2C] shadow-lg shadow-[#0000004D] z-40 p-2">
      <nav className="p-4">
        <ul>
          <li className="mb-4">
            <Link
              href="#"
              className="flex items-center p-3 rounded-2xl bg-[#5A00B4] text-white hover:bg-[#6a11cb] hover:text-white"
            >
              Peças
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="#"
              className="flex items-center p-3 rounded-2xl hover:bg-[#6a11cb] hover:text-white"
            >
              Visualização
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="flex items-center p-3 rounded-2xl hover:bg-[#6a11cb] hover:text-white"
            >
              Clientes
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4 w-full">
        <LogoutButton />
      </div>
    </aside>
  );
};
