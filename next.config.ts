import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
