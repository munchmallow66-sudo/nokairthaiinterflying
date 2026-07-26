"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-tif-navyDark text-slate-300 border-t border-tif-gold/20 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/">
              <BrandLogo size="lg" variant="light" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("academyTagline")}
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4 border-b border-tif-gold/30 pb-2">
              {t("brandSub")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/apply" className="hover:text-tif-gold transition">
                  {t("applyNow")}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-tif-gold transition">
                  {t("trackStatus")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-tif-gold transition">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4 border-b border-tif-gold/30 pb-2">
              Academy Campus
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-tif-gold shrink-0 mt-0.5" />
                <span>{t("headquartersAddress")}</span>
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

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t("allRightsReserved")}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Training</a>
            <a href="#" className="hover:text-slate-400">CAAT License</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
