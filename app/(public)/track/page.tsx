"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
  MessageSquare,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useTheme } from "@/lib/theme-context";

interface ApplicationData {
  id: string;
  applicationNumber: string;
  courseName: string;
  status: string;
  statusLabelTh: string;
  statusLabelEn: string;
  submissionDate: string;
  stepIndex: number;
  remarks: string;
  updatedAt: string;
}

interface TrackingResponse {
  found: boolean;
  studentName?: string;
  nationalId?: string;
  applications?: ApplicationData[];
  error?: string;
}

export default function TrackStatusPage() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleaned = nationalId.replace(/\D/g, "");
    if (!cleaned || cleaned.length !== 13) {
      setErrorMsg("กรุณากรอกเลขบัตรประจำตัวประชาชน 13 หลักให้ถูกต้อง / Please enter a valid 13-digit National ID");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId: cleaned }),
      });

      const data = await res.json();

      if (!res.ok && !data.found) {
        setErrorMsg(data.error || "ไม่พบข้อมูลการสมัครสำหรับเลขบัตรประชาชนนี้");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setNationalId("1234567890123");
    setErrorMsg("");
  };

  return (
    <div
      className={`min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300 ${
        theme === "light" ? "bg-slate-100 text-slate-900" : "bg-tif-navyDark text-slate-100"
      }`}
    >
      {/* Background Glow Effect */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none ${
          theme === "light" ? "bg-amber-300/20" : "bg-tif-gold/20"
        }`}
      />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1
            className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}
          >
            {t("trackPageTitle")}
          </h1>

          <p
            className={`text-sm max-w-xl mx-auto font-medium leading-relaxed ${
              theme === "light" ? "text-slate-600" : "text-slate-200"
            }`}
          >
            {t("trackPageSub")}
          </p>
        </div>

        {/* Search Form Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 transition-all ${
            theme === "light"
              ? "bg-white border-slate-200/90 shadow-slate-200/60"
              : "bg-slate-900/90 border-slate-700/80 shadow-2xl backdrop-blur-xl"
          }`}
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="nationalId"
                className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${
                  theme === "light" ? "text-amber-800" : "text-amber-300"
                }`}
              >
                {t("inputNationalIdLabel")}
              </label>
              <div className="relative">
                <input
                  id="nationalId"
                  type="text"
                  maxLength={17}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder={t("inputNationalIdPlaceholder")}
                  className={`w-full rounded-2xl px-5 py-4 text-base sm:text-lg font-mono font-semibold transition-all outline-none border ${
                    theme === "light"
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400"
                      : "bg-slate-950 border-slate-700 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border ${
                    theme === "light"
                      ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                      : "bg-amber-400/15 text-amber-300 border-amber-400/30 hover:bg-amber-400 hover:text-slate-950 font-bold"
                  }`}
                >
                  ทดสอบด้วยเลขตัวอย่าง
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                className={`flex items-center space-x-2 p-4 rounded-2xl text-xs font-semibold border ${
                  theme === "light"
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : "text-rose-200 bg-rose-950/80 border-rose-500/50"
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="gold"
              size="lg"
              className="w-full py-4 text-base font-bold shadow-lg relative overflow-hidden group rounded-2xl cursor-pointer"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep pointer-events-none" />
              {loading ? (
                <span className="relative z-10 flex items-center space-x-2 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>กำลังค้นหาข้อมูล...</span>
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>{t("searchStatusBtn")}</span>
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Tracking Results Card */}
        {result && result.found && result.applications && (
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-8 animate-in fade-in duration-500 ${
              theme === "light"
                ? "bg-white border-slate-200 shadow-slate-300/40 text-slate-900"
                : "bg-slate-900/95 border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-100"
            }`}
          >
            {/* Result Header */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4 ${
                theme === "light" ? "border-slate-200" : "border-slate-800"
              }`}
            >
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider mb-1 block ${
                    theme === "light" ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  {t("applicantNameLabel")}
                </span>
                <h2
                  className={`text-xl sm:text-2xl font-extrabold font-display flex items-center space-x-2.5 ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl border shrink-0 ${
                      theme === "light"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-amber-400/20 text-amber-300 border-amber-400/30"
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <span>{result.studentName}</span>
                </h2>
              </div>

              <div
                className={`rounded-2xl px-4 py-2.5 text-right border ${
                  theme === "light"
                    ? "bg-slate-50 border-slate-200 text-slate-900"
                    : "bg-slate-950 border-slate-700/80 text-white shadow-inner"
                }`}
              >
                <span
                  className={`text-[10px] block uppercase font-bold tracking-wider ${
                    theme === "light" ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  National ID
                </span>
                <span
                  className={`text-sm font-mono font-extrabold ${
                    theme === "light" ? "text-amber-700" : "text-amber-300"
                  }`}
                >
                  {result.nationalId}
                </span>
              </div>
            </div>

            {/* Applications List */}
            {result.applications.map((app) => (
              <div
                key={app.id}
                className={`space-y-6 rounded-2xl p-6 border shadow-sm ${
                  theme === "light"
                    ? "bg-slate-50/90 border-slate-200"
                    : "bg-slate-950/80 border-slate-800 shadow-inner"
                }`}
              >
                {/* Course & Application Ref Header */}
                <div
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
                    theme === "light" ? "border-slate-200" : "border-slate-800"
                  }`}
                >
                  <div>
                    <div
                      className={`text-xs font-extrabold px-3.5 py-1 rounded-full inline-flex items-center space-x-1.5 mb-2 border ${
                        theme === "light"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-amber-400/15 text-amber-300 border-amber-400/30"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{app.applicationNumber}</span>
                    </div>
                    <h3
                      className={`text-lg sm:text-xl font-extrabold font-display ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {app.courseName}
                    </h3>
                  </div>

                  <div
                    className={`inline-flex items-center space-x-2 border px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      theme === "light"
                        ? "bg-white border-slate-300 text-slate-700 shadow-sm"
                        : "bg-slate-800 border-slate-700 text-slate-200"
                    }`}
                  >
                    <Calendar className={`h-4 w-4 ${theme === "light" ? "text-amber-600" : "text-amber-400"}`} />
                    <span>
                      {t("submittedDateLabel")} {app.submissionDate}
                    </span>
                  </div>
                </div>

                {/* 4-Step Progress Timeline */}
                <div className="space-y-4">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      theme === "light" ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    ขั้นตอนการดำเนินการ (Application Progress)
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Step 1 */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 1
                          ? theme === "light"
                            ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                            : "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : theme === "light"
                          ? "bg-white border-slate-200 text-slate-500 font-medium"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <CheckCircle2
                          className={`h-6 w-6 ${
                            app.stepIndex >= 1
                              ? theme === "light"
                                ? "text-emerald-600"
                                : "text-emerald-400"
                              : theme === "light"
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 1
                            ? theme === "light"
                              ? "text-emerald-950"
                              : "text-white"
                            : theme === "light"
                            ? "text-slate-600"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step1Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 1
                            ? theme === "light"
                              ? "text-emerald-700"
                              : "text-emerald-300"
                            : theme === "light"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Submitted
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 2
                          ? theme === "light"
                            ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                            : "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 1
                          ? theme === "light"
                            ? "bg-amber-50 border-2 border-amber-500 text-amber-950 font-bold animate-pulse shadow-sm"
                            : "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : theme === "light"
                          ? "bg-white border-slate-200 text-slate-500 font-medium"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <FileText
                          className={`h-6 w-6 ${
                            app.stepIndex >= 2
                              ? theme === "light"
                                ? "text-emerald-600"
                                : "text-emerald-400"
                              : app.stepIndex === 1
                              ? theme === "light"
                                ? "text-amber-600"
                                : "text-amber-400"
                              : theme === "light"
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 2
                            ? theme === "light"
                              ? "text-emerald-950"
                              : "text-white"
                            : app.stepIndex === 1
                            ? theme === "light"
                              ? "text-amber-950"
                              : "text-white"
                            : theme === "light"
                            ? "text-slate-600"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step2Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 2
                            ? theme === "light"
                              ? "text-emerald-700"
                              : "text-emerald-300"
                            : app.stepIndex === 1
                            ? theme === "light"
                              ? "text-amber-800"
                              : "text-amber-300"
                            : theme === "light"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Screening
                      </span>
                    </div>

                    {/* Step 3: Internal Written Exam */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 3
                          ? theme === "light"
                            ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                            : "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 2
                          ? theme === "light"
                            ? "bg-amber-50 border-2 border-amber-500 text-amber-950 font-bold animate-pulse shadow-sm"
                            : "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : theme === "light"
                          ? "bg-white border-slate-200 text-slate-500 font-medium"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <PenTool
                          className={`h-6 w-6 ${
                            app.stepIndex >= 3
                              ? theme === "light"
                                ? "text-emerald-600"
                                : "text-emerald-400"
                              : app.stepIndex === 2
                              ? theme === "light"
                                ? "text-amber-600"
                                : "text-amber-400"
                              : theme === "light"
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 3
                            ? theme === "light"
                              ? "text-emerald-950"
                              : "text-white"
                            : app.stepIndex === 2
                            ? theme === "light"
                              ? "text-amber-950"
                              : "text-white"
                            : theme === "light"
                            ? "text-slate-600"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step3Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 3
                            ? theme === "light"
                              ? "text-emerald-700"
                              : "text-emerald-300"
                            : app.stepIndex === 2
                            ? theme === "light"
                              ? "text-amber-800"
                              : "text-amber-300"
                            : theme === "light"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Written Exam
                      </span>
                    </div>

                    {/* Step 4: Interview Exam */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 4
                          ? theme === "light"
                            ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                            : "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 3
                          ? theme === "light"
                            ? "bg-amber-50 border-2 border-amber-500 text-amber-950 font-bold animate-pulse shadow-sm"
                            : "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : theme === "light"
                          ? "bg-white border-slate-200 text-slate-500 font-medium"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <User
                          className={`h-6 w-6 ${
                            app.stepIndex >= 4
                              ? theme === "light"
                                ? "text-emerald-600"
                                : "text-emerald-400"
                              : app.stepIndex === 3
                              ? theme === "light"
                                ? "text-amber-600"
                                : "text-amber-400"
                              : theme === "light"
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 4
                            ? theme === "light"
                              ? "text-emerald-950"
                              : "text-white"
                            : app.stepIndex === 3
                            ? theme === "light"
                              ? "text-amber-950"
                              : "text-white"
                            : theme === "light"
                            ? "text-slate-600"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step4Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 4
                            ? theme === "light"
                              ? "text-emerald-700"
                              : "text-emerald-300"
                            : app.stepIndex === 3
                            ? theme === "light"
                              ? "text-amber-800"
                              : "text-amber-300"
                            : theme === "light"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Interview Exam
                      </span>
                    </div>

                    {/* Step 5: Final Selection Result */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 5
                          ? theme === "light"
                            ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                            : "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 4
                          ? theme === "light"
                            ? "bg-amber-50 border-2 border-amber-500 text-amber-950 font-bold animate-pulse shadow-sm"
                            : "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : theme === "light"
                          ? "bg-white border-slate-200 text-slate-500 font-medium"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <Award
                          className={`h-6 w-6 ${
                            app.stepIndex >= 5
                              ? theme === "light"
                                ? "text-emerald-600"
                                : "text-emerald-400"
                              : app.stepIndex === 4
                              ? theme === "light"
                                ? "text-amber-600"
                                : "text-amber-400"
                              : theme === "light"
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 5
                            ? theme === "light"
                              ? "text-emerald-950"
                              : "text-white"
                            : app.stepIndex === 4
                            ? theme === "light"
                              ? "text-amber-950"
                              : "text-white"
                            : theme === "light"
                            ? "text-slate-600"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step5Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 5
                            ? theme === "light"
                              ? "text-emerald-700"
                              : "text-emerald-300"
                            : app.stepIndex === 4
                            ? theme === "light"
                              ? "text-amber-800"
                              : "text-amber-300"
                            : theme === "light"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Final Result
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Detail & Officer Remarks Box */}
                <div
                  className={`rounded-2xl p-5 border shadow-sm space-y-3 ${
                    theme === "light"
                      ? "bg-amber-50/90 border-amber-200"
                      : "bg-slate-950 border-slate-700/80 shadow-inner"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        theme === "light" ? "text-amber-900/80" : "text-slate-300"
                      }`}
                    >
                      {t("currentStatusLabel")}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        theme === "light" ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      อัปเดตล่าสุด: {app.updatedAt}
                    </span>
                  </div>

                  <div
                    className={`text-base sm:text-xl font-extrabold flex items-center space-x-2.5 ${
                      theme === "light" ? "text-emerald-800" : "text-amber-300"
                    }`}
                  >
                    <Sparkles className="h-5 w-5 text-amber-400 shrink-0 animate-spin" />
                    <span>{language === "th" ? app.statusLabelTh : app.statusLabelEn}</span>
                  </div>

                  <div
                    className={`p-4 rounded-xl border text-sm leading-relaxed font-medium flex items-start space-x-3 ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-slate-800 shadow-sm"
                        : "bg-slate-900 border-slate-700 text-slate-100"
                    }`}
                  >
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        theme === "light" ? "text-amber-600" : "text-amber-400"
                      }`}
                    />
                    <div>
                      <strong
                        className={`font-bold block mb-0.5 ${
                          theme === "light" ? "text-amber-900" : "text-amber-300"
                        }`}
                      >
                        หมายเหตุเจ้าหน้าที่:
                      </strong>
                      <span>{app.remarks}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
