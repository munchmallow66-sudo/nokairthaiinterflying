"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MultiStepForm } from "@/components/admission/multi-step-form";
import { useLanguage } from "@/lib/i18n/language-context";
import { admissionsAreOpen } from "@/lib/admissions";
import { Clock } from "lucide-react";

export default function ApplyPage() {
  const { t } = useLanguage();
  const open = admissionsAreOpen();

  return (
    <div className="min-h-screen flex flex-col bg-tif-bgLight">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
            Online Admission Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-tif-navy font-display">
            {t("applyPageTitle")}
          </h1>
          <p className="text-slate-500 text-sm">
            {t("applyPageSub")}
          </p>
        </div>

        {open ? (
          <MultiStepForm />
        ) : (
          <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-tif-navy font-display">
              {t("admissionsClosedTitle")}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("admissionsClosedDesc")}
            </p>
            <p className="pt-2 text-xs text-slate-400">
              {t("trackStatus")} : <a href="/track" className="text-tif-navy underline">/track</a>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
