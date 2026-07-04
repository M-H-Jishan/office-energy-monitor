import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Energy Monitor",
  description: "Real-time office energy monitoring dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
