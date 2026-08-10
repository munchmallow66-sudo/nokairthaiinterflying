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
      {/*
        Cockpit Sunset Image & Apple Ambient Background Layer.
        Everything here is static and promoted to a single composited layer:
        no blend modes and no blur() filters, both of which force WebKit to
        re-rasterise this full-viewport fixed layer on every scroll frame.
        The ambient orbs are radial gradients (already soft) rather than hard
        circles pushed through a 120-150px Gaussian blur.
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden [transform:translateZ(0)]">
        {/* Subtle Cockpit Backdrop Image */}
        <div className="absolute inset-0 opacity-[0.06]">
          <Image
            src="/cockpit-bg.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Subtle grid lines */}
        <div className="absolute inset-0 apple-grid-lines [mask-image:radial-gradient(ellipse_75%_75%_at_50%_40%,#000_60%,transparent_100%)] opacity-60" />

        {/* Soft Ambient Orbs */}
        <div className="ambient-orb absolute -top-64 left-[10%] w-[860px] h-[860px] bg-[radial-gradient(closest-side,rgba(253,230,138,0.22),rgba(200,162,74,0.10)_55%,transparent_100%)]" />
        <div className="ambient-orb absolute top-[20%] -right-64 w-[900px] h-[900px] bg-[radial-gradient(closest-side,rgba(186,230,253,0.22),rgba(219,234,254,0.10)_55%,transparent_100%)]" />
        <div className="ambient-orb absolute top-[55%] -left-64 w-[960px] h-[960px] bg-[radial-gradient(closest-side,rgba(254,243,199,0.22),rgba(200,162,74,0.10)_55%,transparent_100%)]" />
        <div className="ambient-orb absolute -bottom-64 right-[10%] w-[860px] h-[860px] bg-[radial-gradient(closest-side,rgba(203,213,225,0.18),rgba(224,242,254,0.14)_55%,transparent_100%)]" />

        {/* Subtle Apple Noise overlay */}
        <div className="absolute inset-0 apple-noise-overlay opacity-50" />
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
