// ─── REDUCIR FOTOS ANTES DE SUBIRLAS ────────────────────────────────────────
// Las fotos de cámara o de Drive pesan 10–15 MB y Cloudinary solo acepta 10 MB.
// Aquí se achican en el navegador (máx. 2000 px de lado) antes de enviarlas,
// así se puede subir cualquier foto y la página carga más rápido.

const LADO_MAXIMO = 2000; // píxeles del lado más largo
const CALIDAD = 0.85;
const NO_TOCAR_SI_PESA_MENOS = 1.5 * 1024 * 1024; // 1.5 MB

export const PESO_MAXIMO_IMAGEN = 10 * 1024 * 1024; // límite de Cloudinary

export async function comprimirImagen(file: File): Promise<File> {
  // Los GIF (animados) y SVG se dejan como están
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size <= NO_TOCAR_SI_PESA_MENOS) return file;

  try {
    const imagen = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
    const ancho = Math.round(imagen.width * escala);
    const alto = Math.round(imagen.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(imagen, 0, 0, ancho, alto);
    imagen.close();

    // Los PNG pueden tener fondo transparente: se guardan como WebP para no perderlo
    const tipo = file.type === "image/png" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, CALIDAD));
    if (!blob || blob.size >= file.size) return file;

    const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
    const nombre = file.name.replace(/\.[^.]+$/, "") + "." + extension;
    return new File([blob], nombre, { type: blob.type });
  } catch {
    // Si el navegador no puede leer la foto (por ejemplo, formato HEIC), se envía tal cual
    return file;
  }
}

export function pesoEnMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}
