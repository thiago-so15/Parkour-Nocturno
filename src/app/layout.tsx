import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parkour Nocturno",
  description: "Parkour urbano nocturno 2D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
