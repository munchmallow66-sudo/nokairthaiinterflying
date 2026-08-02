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
        className={`pointer-events-auto w-full glass-pill-nav rounded-full pl-4 pr-3.5 sm:px-6 py-2 sm:py-2.5 transition-all duration-300 flex items-center justify-between shadow-2xl ${
          isScrolled
            ? "py-2 sm:py-2 bg-[#051329] border-tif-gold/50 shadow-[0_15px_40px_-10px_rgba(5,19,41,0.8)] scale-[0.99]"
            : "border-tif-gold/30 hover:border-tif-gold/50"
        }`}
        style={{ isolation: "isolate" }}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink min-w-0 pr-1 sm:pr-4">
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
        <div className="flex items-center space-x-1.5 min-[380px]:space-x-2 sm:space-x-3 shrink-0">
          <LanguageSwitcher variant="glass" className="scale-90 min-[380px]:scale-95 sm:scale-100 origin-right" />

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
            className="lg:hidden p-1.5 min-[380px]:p-2 text-white hover:text-tif-gold rounded-full bg-white/10 hover:bg-white/20 transition shrink-0 flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-3 rounded-3xl bg-[#051329] border border-tif-gold/40 p-5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in slide-in-from-top-3 duration-250">
          <nav className="flex flex-col space-y-1.5 text-sm font-semibold">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-between ${
                isActive("/") && pathname === "/"
                  ? "bg-tif-gold text-tif-navy font-bold shadow-md"
                  : "text-white hover:text-tif-gold hover:bg-white/10"
              }`}
            >
              <span>{t("home")}</span>
            </Link>

            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-between ${
                isActive("/track")
                  ? "bg-tif-gold text-tif-navy font-bold shadow-md"
                  : "text-white hover:text-tif-gold hover:bg-white/10"
              }`}
            >
              <span>{t("trackStatus")}</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-between ${
                isActive("/contact")
                  ? "bg-tif-gold text-tif-navy font-bold shadow-md"
                  : "text-white hover:text-tif-gold hover:bg-white/10"
              }`}
            >
              <span>{t("contact")}</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-tif-gold/20">
            <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" className="w-full rounded-full font-bold shadow-gold py-3 text-sm">
                {t("applyNow")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
