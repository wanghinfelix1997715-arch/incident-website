import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfterFall — RN Documentation Studio",
  description: "Post-fall assessment and four independent RN documentation drafts.",
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
