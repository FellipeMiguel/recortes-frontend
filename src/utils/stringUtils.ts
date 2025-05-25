export function sanitize(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractKeyFromImageUrl(
  imageUrl: string | undefined | null
): string {
  if (!imageUrl) return "Chave indisponível";
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const fileNameWithExtension = pathParts[pathParts.length - 1];

    const key = fileNameWithExtension.replace(
      /\.(png|jpg|jpeg|webp|gif)$/i,
      ""
    );
    return key;
  } catch (e) {
    console.warn(
      "Não foi possível parsear a imageUrl como URL completa, tentando extração simples:",
      imageUrl,
      e
    );
    const parts = imageUrl.split("/");
    const lastPart = parts[parts.length - 1];
    const keyFallback = lastPart.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "");
    return keyFallback || "Chave inválida";
  }
}
