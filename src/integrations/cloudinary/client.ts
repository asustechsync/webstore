import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function subirImagen(archivo: File, carpeta = "productos") {
  const buffer = Buffer.from(await archivo.arrayBuffer());

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: carpeta }, (error, resultado) => {
        if (error || !resultado) return reject(error);
        resolve({ url: resultado.secure_url, publicId: resultado.public_id });
      })
      .end(buffer);
  });
}

export async function eliminarImagen(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
