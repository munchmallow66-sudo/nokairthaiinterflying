import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/app/providers";

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
    <html lang="en">
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
