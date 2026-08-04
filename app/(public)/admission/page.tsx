"use client";

import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdmissionPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          {t("admGuideEyebrow")}
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          {t("admGuideTitle")}
        </h1>
        <p className="text-slate-600 text-lg">
          {t("admGuideDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-tif-gold" /> {t("generalRequirements")}
          </h3>
          <ul className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{t("reqAgeLabel")}</strong> {t("reqAgeValue")}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{t("reqEduLabel")}</strong> {t("reqEduValue")}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{t("reqMedLabel")}</strong> {t("reqMedValue")}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>{t("reqEngLabel")}</strong> {t("reqEngValue")}</span>
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
            <FileText className="mr-2 h-6 w-6 text-tif-gold" /> {t("digitalDocsTitle")}
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>{t("digitalDoc1")}</li>
            <li>{t("digitalDoc2")}</li>
            <li>{t("digitalDoc3")}</li>
            <li>{t("digitalDoc4")}</li>
            <li>{t("digitalDoc5")}</li>
            <li>{t("digitalDoc6")}</li>
            <li>{t("digitalDoc7")}</li>
          </ul>
          <div className="pt-4 border-t border-slate-100">
            <Link href="/apply">
              <Button variant="gold" className="w-full">
                {t("beginAppBtn")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

