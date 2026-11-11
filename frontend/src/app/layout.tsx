import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/shared/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "miApp | Gestión de evaluaciones",
  description: "Panel para administrar candidatos, puestos y evaluaciones.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
