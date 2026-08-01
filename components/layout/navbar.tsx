"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const pathname = usePathname();
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed top-2 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
      {/* Floating Pill Container */}
      <div
        className={`pointer-events-auto w-full glass-pill-nav rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300 flex items-center justify-between shadow-2xl ${
          isScrolled
            ? "py-2 sm:py-2 bg-tif-navyDark/95 border-tif-gold/50 shadow-[0_15px_40px_-10px_rgba(5,19,41,0.8)] scale-[0.99]"
            : "border-tif-gold/30 hover:border-tif-gold/50"
        }`}
        style={{ isolation: "isolate" }}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0 pr-2 sm:pr-4">
          <BrandLogo size="sm" variant="light" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-200">
          {/* Home */}
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              isActive("/") && pathname === "/"
                ? "bg-tif-gold/20 text-tif-gold font-bold border border-tif-gold/40 shadow-[0_0_12px_rgba(200,162,74,0.3)]"
                : "hover:text-tif-gold hover:bg-white/5"
            }`}
          >
            {t("home")}
          </Link>

          {/* Track Status */}
          <Link
            href="/track"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              isActive("/track")
                ? "bg-tif-gold/20 text-tif-gold font-bold border border-tif-gold/40 shadow-[0_0_12px_rgba(200,162,74,0.3)]"
                : "hover:text-tif-gold hover:bg-white/5"
            }`}
          >
            {t("trackStatus")}
          </Link>

          {/* Contact */}
          <Link
            href="/contact"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              isActive("/contact")
                ? "bg-tif-gold/20 text-tif-gold font-bold border border-tif-gold/40 shadow-[0_0_12px_rgba(200,162,74,0.3)]"
                : "hover:text-tif-gold hover:bg-white/5"
            }`}
          >
            {t("contact")}
          </Link>
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <LanguageSwitcher variant="glass" className="scale-95 sm:scale-100" />

          {/* Apply Now Gold Pill Button */}
          <Link href="/apply" className="hidden sm:inline-block">
            <Button
              variant="gold"
              size="sm"
              className="rounded-full shadow-gold font-bold text-xs px-4 sm:px-5 py-2 hover:scale-105 transition-all duration-200"
            >
              {t("applyNow")}
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-tif-gold rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-3 rounded-3xl bg-tif-navyDark/98 border border-tif-gold/30 p-5 space-y-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-3 duration-250">
          <nav className="flex flex-col space-y-1 text-sm text-slate-200 font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl transition ${
                isActive("/") && pathname === "/"
                  ? "bg-tif-gold/20 text-tif-gold font-bold"
                  : "hover:bg-white/5"
              }`}
            >
              {t("home")}
            </Link>

            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl transition ${
                isActive("/track")
                  ? "bg-tif-gold/20 text-tif-gold font-bold"
                  : "hover:bg-white/5"
              }`}
            >
              {t("trackStatus")}
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl transition ${
                isActive("/contact")
                  ? "bg-tif-gold/20 text-tif-gold font-bold"
                  : "hover:bg-white/5"
              }`}
            >
              {t("contact")}
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-700/60">
            <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" className="w-full rounded-full font-bold shadow-gold">
                {t("applyNow")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
