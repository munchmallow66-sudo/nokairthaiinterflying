"use client";

import Link from "next/link";
import { ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PilotCareerPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          {t("careerRoadmapEyebrow")}
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          {t("careerRoadmapTitle")}
        </h1>
        <p className="text-slate-600 text-lg">
          {t("careerRoadmapDesc")}
        </p>
      </div>

      <div className="relative border-l-2 border-tif-gold/40 max-w-3xl mx-auto pl-8 space-y-12">
        {/* Step 1 */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-tif-navy text-tif-gold font-bold">
            1
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("roadmapStep1Title")}</h3>
          <p className="text-sm text-slate-600 mt-2">
            {t("roadmapStep1Desc")}
          </p>
        </div>

        {/* Step 2 */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-tif-navy text-tif-gold font-bold">
            2
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("roadmapStep2Title")}</h3>
          <p className="text-sm text-slate-600 mt-2">
            {t("roadmapStep2Desc")}
          </p>
        </div>

        {/* Step 3 */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-tif-navy text-tif-gold font-bold">
            3
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("roadmapStep3Title")}</h3>
          <p className="text-sm text-slate-600 mt-2">
            {t("roadmapStep3Desc")}
          </p>
        </div>

        {/* Step 4 */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-tif-gold text-tif-navyDark font-bold">
            4
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">{t("roadmapStep4Title")}</h3>
          <p className="text-sm text-slate-600 mt-2">
            {t("roadmapStep4Desc")}
          </p>
        </div>
      </div>

      {/* Program Costs Information Notice */}
      <div className="max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-tif-gold/40 shadow-xl space-y-3">
        <div className="flex items-center space-x-3 text-tif-gold font-bold">
          <div className="p-2.5 rounded-xl bg-tif-gold/20 text-tif-gold border border-tif-gold/30 shrink-0">
            <DollarSign className="h-6 w-6 text-tif-gold" />
          </div>
          <h3 className="text-xl font-extrabold font-display text-white">{t("impNote3Title")}</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium pl-1">
          {t("impNote3Desc2")}
        </p>
      </div>

      <div className="text-center pt-4">
        <Link href="/apply">
          <Button variant="gold" size="lg">
            {t("applyCareerBtn")} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

