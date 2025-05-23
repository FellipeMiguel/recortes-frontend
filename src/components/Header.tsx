import Image from "next/image";

export function Header() {
  return (
    <header className="hidden sm:flex items-center justify-between px-6 py-4 bg-[#440986] text-white">
      <Image
        src="/fanation_logo_header.svg"
        alt="Logo do Fanation"
        width={120}
        height={40}
      />
    </header>
  );
}
