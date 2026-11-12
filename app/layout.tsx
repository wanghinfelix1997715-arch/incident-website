import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareNote — RN Documentation Studio",
  description: "RN incident documentation and selected-target progress notes and correspondence.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
