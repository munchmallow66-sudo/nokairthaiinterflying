import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const revalidate = 60; // ISR Revalidation every 60 seconds

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col text-slate-900 relative apple-bg-pattern selection:bg-tif-gold selection:text-tif-navyDark overflow-x-hidden">
      {/* Cockpit Sunset Image & Apple Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Cockpit Backdrop Image */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply">
          <Image
            src="/cockpit-bg.jpg"
            alt="Cockpit Background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Subtle grid lines */}
        <div className="absolute inset-0 apple-grid-lines [mask-image:radial-gradient(ellipse_75%_75%_at_50%_40%,#000_60%,transparent_100%)] opacity-60" />

        {/* Soft Ambient Blurred Circles / Orbs */}
        <div
          className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-200/25 via-tif-gold/15 to-transparent blur-[120px] animate-pulse"
          style={{ animationDuration: "14s" }}
        />
        <div className="absolute top-1/3 -right-36 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-sky-200/25 via-blue-100/15 to-transparent blur-[140px]" />
        <div className="absolute top-2/3 -left-36 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-amber-100/25 via-tif-gold/15 to-transparent blur-[150px]" />
        <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-slate-300/20 via-sky-100/20 to-transparent blur-[130px]" />

        {/* Subtle Apple Noise overlay */}
        <div className="absolute inset-0 apple-noise-overlay opacity-60 mix-blend-overlay" />
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
