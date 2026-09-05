import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prerenderizado parcial: cada ruta se sirve como un armazón estático desde
  // el primer milisegundo y solo los trozos que dependen de la petición
  // (los filtros del catálogo, el usuario, el carrito) llegan por streaming.
  // Es lo que permite que /productos responda al instante aunque su contenido
  // dependa de 8 parámetros de URL que nunca se podrían pre-construir.
  cacheComponents: true,
  experimental: {
    // Por defecto Next valida CADA página buscando un armazón estático,
    // incluida /admin y /cuenta — que son dinámicas a propósito (sesión y
    // gestión en vivo, ver `instant = false` en sus layouts). Con
    // "manual-warning" solo se valida lo que declara `instant` explícito, así
    // el aviso deja de dispararse en cada página nueva del panel y se
    // concentra donde sí importa: las rutas públicas que sí deben ser
    // instantáneas.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  // Permite abrir el servidor de desarrollo desde dispositivos de la red local.
  // Agrega aquí la IP de la PC correspondiente a cada red que uses.
  allowedDevOrigins: ["192.168.18.211", "192.168.1.100", "192.168.0.212"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
