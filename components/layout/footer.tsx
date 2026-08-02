"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Award } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#051329] text-slate-300 border-t-2 border-tif-gold/40 pt-16 pb-12 relative overflow-hidden">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-tif-navy/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Brand Info (Col 5) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-block">
              <BrandLogo size="lg" variant="light" />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-md">
              {t("academyTagline")}
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-tif-gold/10 border border-tif-gold/30 text-xs font-bold text-tif-gold">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>CAAT Approved Aviation Training Organization</span>
            </div>
          </div>

          {/* Quick Links (Col 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-display mb-4 pb-2 border-b border-tif-gold/30 flex items-center justify-between">
              <span>{t("brandSub")}</span>
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link href="/apply" className="text-slate-300 hover:text-tif-gold transition-colors flex items-center space-x-2">
                  <span className="text-tif-gold">•</span>
                  <span>{t("applyNow")}</span>
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-slate-300 hover:text-tif-gold transition-colors flex items-center space-x-2">
                  <span className="text-tif-gold">•</span>
                  <span>{t("trackStatus")}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-tif-gold transition-colors flex items-center space-x-2">
                  <span className="text-tif-gold">•</span>
                  <span>{t("contact")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (Col 4) */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-display mb-4 pb-2 border-b border-tif-gold/30">
              Academy Campus
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-tif-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t("headquartersAddress")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-tif-gold shrink-0" />
                <span>{t("phoneContact")}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-tif-gold shrink-0" />
                <span>{t("emailContact")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-center md:text-left">© {new Date().getFullYear()} {t("allRightsReserved")}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-slate-400 font-medium">
            <a href="#" className="hover:text-tif-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-tif-gold transition-colors">Terms of Training</a>
            <a href="#" className="hover:text-tif-gold transition-colors">CAAT License</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

