"use client";

import { Plane, ShieldCheck, Award } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-16 space-y-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          {t("aboutEyebrow")}
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          {t("aboutTitle")}
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          {t("aboutDesc")}
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tif-navy text-tif-gold">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("caatCardTitle")}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("caatCardDesc")}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tif-navy text-tif-gold">
            <Plane className="h-8 w-8 transform -rotate-45" />
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("fleetCardTitle")}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("fleetCardDesc")}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tif-navy text-tif-gold">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("instructorCardTitle")}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("instructorCardDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}

