import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Chikitsak – AI Powered Personalized Health Operating System",
  description: "AI-powered personalized health operating system providing intelligent healthcare guidance, symptom checking, lab analysis, and more.",
  keywords: ["health", "AI", "symptom checker", "lab reports", "medication", "healthcare"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
