import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

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
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
