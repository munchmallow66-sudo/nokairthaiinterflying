"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MultiStepForm } from "@/components/admission/multi-step-form";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAdmissions } from "@/lib/admissions";
import { Clock, AlertCircle, Loader2 } from "lucide-react";

export default function ApplyPage() {
  const { t } = useLanguage();
  const { isOpen, remaining, quota, isLoading } = useAdmissions();

  return (
    <div className="min-h-screen flex flex-col bg-tif-bgLight">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
            Online Admission Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-tif-navy font-display">
            {t("applyPageTitle")}
          </h1>
          <p className="text-slate-500 text-sm">
            {t("applyPageSub")}
          </p>

          {isOpen && remaining !== null && remaining > 0 && (
            <div className="pt-2 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-semibold shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>
                  {remaining === 1
                    ? "เปิดรับสมัครรอบพิเศษ: เหลือ 1 ที่นั่งสุดท้าย (ระบบจะปิดอัตโนมัติทันทีที่มีผู้สมัครส่งสำเร็จ)"
                    : `เปิดรับสมัครรอบพิเศษ: เหลือ ${remaining} ที่นั่ง (จากโควตา ${quota} ที่นั่ง)`}
                </span>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="max-w-md mx-auto py-20 text-center flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-tif-gold" />
            <p className="text-sm">กำลังตรวจสอบสถานะการเปิดรับสมัคร...</p>
          </div>
        ) : isOpen ? (
          <MultiStepForm />
        ) : (
          <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4 shadow-sm">
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
              {t("trackStatus")} : <a href="/track" className="text-tif-navy underline font-medium hover:text-tif-gold">/track</a>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
