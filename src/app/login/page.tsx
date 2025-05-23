import Image from "next/image";

export default function Login() {
  return (
    <main className="flex flex-col items-center p-24 gap-4">
      <Image
        src="/fanation_logo_login.svg"
        alt="Logo do Fanation"
        width={152}
        height={31}
        priority
      />

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-[#9A0FF1] text-2xl sm:text-3xl font-semibold">
          Bem-vindo ao Fanation
        </h1>
        <p className="text-neutral-800 text-sm sm:text-base max-w-xs">
          Acesse a sua conta para iniciar
        </p>
      </div>

      <button className="w-full max-w-xs sm:max-w-sm h-12 bg-[#070707] text-white rounded-lg text-sm sm:text-base transition-colors hover:bg-gray-800">
        Entrar com Google
      </button>
    </main>
  );
}
