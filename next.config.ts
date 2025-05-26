/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // ou outras configurações que você já tenha
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mqrgmuxpzusseaocpnru.supabase.co",
        port: "", // Deixe em branco se for a porta padrão (443 para https)
        pathname: "/storage/v1/object/public/recortes/**", // Seja o mais específico possível com o caminho
      },
      // Você pode adicionar outros domínios aqui se precisar
    ],
  },
};

export default nextConfig;
