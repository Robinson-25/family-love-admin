import type { Metadata, Viewport } from "next";
import "./globals.css";
import { raleway } from "@/fonts/fonts";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Panel · Family Love",
  description: "Panel de administración de Family Love",
  icons: { icon: "/logo-family-love.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`min-h-screen bg-gray-100 antialiased ${raleway.className}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
