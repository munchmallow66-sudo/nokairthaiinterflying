"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MultiStepForm } from "@/components/admission/multi-step-form";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ApplyPage() {
  const { t } = useLanguage();

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
        <MultiStepForm />
      </main>
      <Footer />
    </div>
  );
}
