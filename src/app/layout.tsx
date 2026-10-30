import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Interval Training",
  description: "Tu ritmo. Tu límite. Temporizador Tabata y HIIT.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Interval Training",
    statusBarStyle: "black-translucent",
  },
};
export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
