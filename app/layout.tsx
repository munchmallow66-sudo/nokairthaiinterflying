import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";

// Self-hosted by Next: no fonts.googleapis.com round trip before first paint.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thai Inter Flying | Student Admission System",
  description: "Official Student Admission Management System for Thai Inter Flying Aviation Academy Thailand. CAAT ATO Accredited.",
  keywords: ["Thai Inter Flying", "Flight School Thailand", "Pilot Training", "CPL", "PPL", "ATPL", "Aviation Academy"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
