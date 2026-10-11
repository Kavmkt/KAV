import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toy Studio — seu boneco colecionável",
  description: "Envie suas fotos e receba seu boneco colecionável de vinil em 3 vistas: frente, lateral e traseira.",
};

export const viewport: Viewport = { themeColor: "#14102b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
