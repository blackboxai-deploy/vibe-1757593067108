import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AudioSeparator - AI Audio Separation",
  description: "Separate voice and music with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}