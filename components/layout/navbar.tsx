"use client";

import * as React from "react";
import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-nav py-3 shadow-lg" : "bg-tif-navy/90 py-4"
        }`}
      style={{ isolation: "isolate" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <BrandLogo size="md" variant="light" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-200">
            <Link href="/" className="hover:text-tif-gold transition">
              {t("home")}
            </Link>
            <Link href="/track" className="hover:text-tif-gold transition">
              {t("trackStatus")}
            </Link>
            <Link href="/contact" className="hover:text-tif-gold transition">
              {t("contact")}
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3 relative z-[60]">
            <LanguageSwitcher variant="glass" />

            <Link href="/apply">
              <Button variant="gold" size="sm">
                {t("applyNow")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2 relative z-[60]">
            <LanguageSwitcher variant="glass" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-tif-gold"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-tif-navyDark border-b border-tif-gold/20 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 text-base text-slate-200">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-tif-gold">
              {t("home")}
            </Link>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="hover:text-tif-gold">
              {t("trackStatus")}
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-tif-gold">
              {t("contact")}
            </Link>
          </nav>
          <div className="pt-4 border-t border-slate-700/60 flex flex-col gap-3">
            <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" className="w-full">
                {t("applyNow")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
