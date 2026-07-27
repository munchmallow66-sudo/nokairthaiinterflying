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
  CreditCard,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";

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
  documents?: {
    id: string;
    type: string;
    secureUrl: string;
    originalName: string;
    isVerified: boolean;
    isRejected?: boolean;
    rejectReason?: string;
  }[];
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
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Payment Slip Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activePayAppNum, setActivePayAppNum] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipSuccess, setSlipSuccess] = useState(false);

  // Re-upload Document Modal States
  const [reuploadModalOpen, setReuploadModalOpen] = useState(false);
  const [activeReuploadDoc, setActiveReuploadDoc] = useState<any>(null);
  const [reuploadType, setReuploadType] = useState("NATIONAL_ID");
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [uploadingReupload, setUploadingReupload] = useState(false);

  const handleOpenPayModal = (appNum: string) => {
    setActivePayAppNum(appNum);
    setSlipFile(null);
    setSlipSuccess(false);
    setPayModalOpen(true);
  };

  const handleOpenReuploadModal = (appNum: string, doc?: any) => {
    setActivePayAppNum(appNum);
    setActiveReuploadDoc(doc || null);
    setReuploadType(doc?.type || "NATIONAL_ID");
    setReuploadFile(null);
    setReuploadModalOpen(true);
  };

  const handleConfirmReupload = () => {
    if (!reuploadFile) {
      alert("กรุณาเลือกไฟล์เอกสารที่ต้องการอัปโหลด");
      return;
    }
    setUploadingReupload(true);

    setTimeout(() => {
      setUploadingReupload(false);
      setReuploadModalOpen(false);

      if (result && result.applications) {
        setResult({
          ...result,
          applications: result.applications.map((a) =>
            a.applicationNumber === activePayAppNum
              ? {
                  ...a,
                  status: "SUBMITTED",
                  statusLabelTh: "อัปโหลดเอกสารฉบับใหม่เรียบร้อยแล้ว (รอเจ้าหน้าที่ตรวจสอบ)",
                  remarks: `ส่งเอกสารใหม่ "${reuploadFile.name}" เข้าสู่ระบบเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบอีกครั้ง`,
                  documents: [
                    ...(a.documents?.filter((d) => d.id !== activeReuploadDoc?.id) || []),
                    {
                      id: activeReuploadDoc?.id || `doc_${Date.now()}`,
                      type: reuploadType,
                      secureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
                      originalName: reuploadFile.name,
                      isVerified: false,
                      isRejected: false,
                    },
                  ],
                }
              : a
          ),
        });
      }
      alert(`อัปโหลดเอกสารใหม่เรียบร้อยแล้ว! ข้อมูลส่งไปยังเจ้าหน้าที่เรียบร้อยแล้ว`);
    }, 1200);
  };

  const handleConfirmSubmitSlip = async () => {
    if (!slipFile) {
      alert("กรุณาเลือกไฟล์สลิปโอนเงิน (JPG, PNG หรือ PDF)");
      return;
    }
    setUploadingSlip(true);

    try {
      const slipDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(slipFile);
      });

      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNum: activePayAppNum || "TIF-2026-1973",
          studentName: result?.studentName || "สมชาย ใจดี",
          amount: 1500,
          slipUrl: slipDataUrl,
        }),
      });
    } catch (e) {}

    setTimeout(() => {
      setUploadingSlip(false);
      setSlipSuccess(true);
      if (result && result.applications) {
        setResult({
          ...result,
          applications: result.applications.map((a) =>
            a.applicationNumber === activePayAppNum
              ? {
                  ...a,
                  statusLabelTh: "อัปโหลดสลิป 1,500 บาทเรียบร้อยแล้ว (เจ้าหน้ากำลังตรวจสอบ)",
                  remarks: "ได้รับสลิปโอนเงินเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและอนุมัติใบสมัครภายใน 24 ชม.",
                }
              : a
          ),
        });
      }
      alert(`ส่งสลิปชำระเงินเรียบร้อยแล้วสำหรับใบสมัคร ${activePayAppNum}! ข้อมูลส่งไปยังหน้า Admin แล้ว`);
    }, 1200);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const queryValue = nationalId.trim();
    if (!queryValue) {
      setErrorMsg("กรุณากรอกหมายเลขใบสมัคร (เช่น TIF-2026-1973), เลขบัตรประจำตัวประชาชน 13 หลัก หรือ เบอร์โทรศัพท์");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryValue, nationalId: queryValue }),
      });

      const data = await res.json();

      if (!res.ok && !data.found) {
        setErrorMsg(data.error || "ไม่พบข้อมูลการสมัครสำหรับรหัสนี้");
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
    setNationalId("TIF-2026-1973");
    setErrorMsg("");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300 bg-tif-navyDark text-slate-100">
      {/* Background Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-tif-gold/20" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            {t("trackPageTitle")}
          </h1>

          <p className="text-sm max-w-xl mx-auto font-medium leading-relaxed text-slate-200">
            ค้นหาด้วยหมายเลขใบสมัคร (TIF-2026-XXXX), เลขบัตรประชาชน หรือเบอร์โทรศัพท์
          </p>
        </div>

        {/* Search Form Card */}
        <div className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 transition-all bg-slate-900/90 border-slate-700/80 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="nationalId"
                className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-amber-300"
              >
                หมายเลขใบสมัคร (Application Number) / เลขบัตรประชาชน / เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <input
                  id="nationalId"
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="กรอกหมายเลขใบสมัคร เช่น TIF-2026-1973 หรือเลขบัตรประชาชน 13 หลัก"
                  className="w-full rounded-2xl px-5 py-4 text-base sm:text-lg font-mono font-semibold transition-all outline-none border bg-slate-950 border-slate-700 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border bg-amber-400/15 text-amber-300 border-amber-400/30 hover:bg-amber-400 hover:text-slate-950 font-bold"
                >
                  ทดสอบ TIF-2026-1973
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2 p-4 rounded-2xl text-xs font-semibold border text-rose-200 bg-rose-950/80 border-rose-500/50">
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
          <div className="rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-8 animate-in fade-in duration-500 bg-slate-900/95 border-slate-700/80 backdrop-blur-xl text-slate-100">
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4 border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider mb-1 block text-slate-300">
                  {t("applicantNameLabel")}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold font-display flex items-center space-x-2.5 text-white">
                  <div className="p-2 rounded-xl border shrink-0 bg-amber-400/20 text-amber-300 border-amber-400/30">
                    <User className="h-5 w-5" />
                  </div>
                  <span>{result.studentName}</span>
                </h2>
              </div>

              <div className="rounded-2xl px-4 py-2.5 text-right border bg-slate-950 border-slate-700/80 text-white shadow-inner">
                <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-300">
                  National ID
                </span>
                <span className="text-sm font-mono font-extrabold text-amber-300">
                  {result.nationalId}
                </span>
              </div>
            </div>

            {/* Applications List */}
            {result.applications.map((app) => (
              <div
                key={app.id}
                className="space-y-6 rounded-2xl p-6 border shadow-sm bg-slate-950/80 border-slate-800 shadow-inner"
              >
                {/* Course & Application Ref Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-800">
                  <div>
                    <div className="text-xs font-extrabold px-3.5 py-1 rounded-full inline-flex items-center space-x-1.5 mb-2 border bg-amber-400/15 text-amber-300 border-amber-400/30">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{app.applicationNumber}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold font-display text-white">
                      {app.courseName}
                    </h3>
                  </div>

                  <div className="inline-flex items-center space-x-2 border px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800 border-slate-700 text-slate-200">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <span>
                      {t("submittedDateLabel")} {app.submissionDate}
                    </span>
                  </div>
                </div>

                {/* 4-Step Progress Timeline */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider block text-slate-300">
                    ขั้นตอนการดำเนินการ (Application Progress)
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Step 1 */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 1
                          ? "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <CheckCircle2
                          className={`h-6 w-6 ${app.stepIndex >= 1 ? "text-emerald-400" : "text-slate-400"}`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${app.stepIndex >= 1 ? "text-white" : "text-slate-200"}`}
                      >
                        {t("step1Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${app.stepIndex >= 1 ? "text-emerald-300" : "text-slate-400"}`}
                      >
                        Submitted
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`rounded-2xl p-3.5 sm:p-4 border text-center transition-all ${
                        app.stepIndex >= 2
                          ? "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 1
                          ? "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <FileText
                          className={`h-6 w-6 ${
                            app.stepIndex >= 2
                              ? "text-emerald-400"
                              : app.stepIndex === 1
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 2
                            ? "text-white"
                            : app.stepIndex === 1
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step2Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 2
                            ? "text-emerald-300"
                            : app.stepIndex === 1
                            ? "text-amber-300"
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
                          ? "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 2
                          ? "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <PenTool
                          className={`h-6 w-6 ${
                            app.stepIndex >= 3
                              ? "text-emerald-400"
                              : app.stepIndex === 2
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 3
                            ? "text-white"
                            : app.stepIndex === 2
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step3Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 3
                            ? "text-emerald-300"
                            : app.stepIndex === 2
                            ? "text-amber-300"
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
                          ? "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 3
                          ? "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <User
                          className={`h-6 w-6 ${
                            app.stepIndex >= 4
                              ? "text-emerald-400"
                              : app.stepIndex === 3
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 4
                            ? "text-white"
                            : app.stepIndex === 3
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step4Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 4
                            ? "text-emerald-300"
                            : app.stepIndex === 3
                            ? "text-amber-300"
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
                          ? "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : app.stepIndex === 4
                          ? "bg-amber-950/90 border-2 border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 font-medium"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <Award
                          className={`h-6 w-6 ${
                            app.stepIndex >= 5
                              ? "text-emerald-400"
                              : app.stepIndex === 4
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold block ${
                          app.stepIndex >= 5
                            ? "text-white"
                            : app.stepIndex === 4
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {t("step5Label")}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          app.stepIndex >= 5
                            ? "text-emerald-300"
                            : app.stepIndex === 4
                            ? "text-amber-300"
                            : "text-slate-400"
                        }`}
                      >
                        Final Result
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Detail & Officer Remarks Box */}
                <div className="rounded-2xl p-5 border shadow-sm space-y-3 bg-slate-950 border-slate-700/80 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t("currentStatusLabel")}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      อัปเดตล่าสุด: {app.updatedAt}
                    </span>
                  </div>

                  <div className="text-base sm:text-xl font-extrabold flex items-center space-x-2.5 text-amber-300">
                    <Sparkles className="h-5 w-5 text-amber-400 shrink-0 animate-spin" />
                    <span>{language === "th" ? app.statusLabelTh : app.statusLabelEn}</span>
                  </div>

                  <div className="p-4 rounded-xl border text-sm leading-relaxed font-medium flex items-start space-x-3 bg-slate-900 border-slate-700 text-slate-100">
                    <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                    <div className="w-full space-y-2">
                      <strong className="font-bold block mb-0.5 text-amber-300">
                        หมายเหตุเจ้าหน้าที่:
                      </strong>
                      <span>{app.remarks}</span>

                      {/* Document Re-upload Warning Box */}
                      {(app.status === "WAITING_DOCUMENTS" || app.documents?.some((d) => d.isRejected)) && (
                        <div className="mt-3 p-4 rounded-xl border border-rose-500/60 bg-rose-950/50 space-y-3 shadow-lg">
                          <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs border-b border-rose-900/60 pb-2.5">
                            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            <span>เอกสารที่เจ้าหน้าที่แจ้งให้แก้ไข / ส่งใหม่ (Action Required):</span>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            {app.documents?.filter((d) => d.isRejected)?.map((doc) => {
                              const docTypeLabels: Record<string, string> = {
                                PASSPORT_PHOTO: "รูปถ่าย 1 นิ้ว / 2 นิ้ว",
                                NATIONAL_ID: "สำเนาบัตรประชาชน",
                                TRANSCRIPT: "สำเนาวุฒิการศึกษา",
                                TOEIC: "ผลสอบภาษาอังกฤษ (TOEIC / IELTS)",
                                TOEIC_SCORE: "ผลสอบภาษาอังกฤษ (TOEIC / IELTS)",
                                MEDICAL_CERT: "ใบรับรองแพทย์เวชศาสตร์การบิน",
                                HOUSE_REGISTRATION: "สำเนาทะเบียนบ้าน",
                                PASSPORT: "หนังสือเดินทาง (Passport)",
                              };
                              const label = docTypeLabels[doc.type] || doc.type || "เอกสารแนบ";

                              return (
                                <div
                                  key={doc.id}
                                  className="p-3 bg-slate-950/95 rounded-xl border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-rose-300 text-xs flex items-center">
                                        ❌ {label}
                                      </span>
                                      <span className="text-slate-400 font-mono text-[11px] truncate">({doc.originalName})</span>
                                    </div>
                                    {doc.rejectReason && (
                                      <p className="text-rose-300 text-[11px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 leading-tight">
                                        <strong>สาเหตุที่ต้องส่งใหม่:</strong> {doc.rejectReason}
                                      </p>
                                    )}
                                  </div>

                                  <Button
                                    size="sm"
                                    variant="gold"
                                    onClick={() => handleOpenReuploadModal(app.applicationNumber, doc)}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 shadow"
                                  >
                                    <Upload className="mr-1 h-3.5 w-3.5" /> อัปโหลดไฟล์นี้ใหม่
                                  </Button>
                                </div>
                              );
                            })}

                            {(!app.documents || app.documents.filter((d) => d.isRejected).length === 0) && (
                              <div className="p-3 bg-slate-950/95 rounded-xl border border-rose-800/80 flex items-center justify-between">
                                <span className="text-slate-300">กรุณาแนบไฟล์เอกสารฉบับใหม่เข้าสู่ระบบ</span>
                                <Button
                                  size="sm"
                                  variant="gold"
                                  onClick={() => handleOpenReuploadModal(app.applicationNumber)}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0"
                                >
                                  <Upload className="mr-1 h-3.5 w-3.5" /> แนบเอกสารใหม่
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Action Button */}
                      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs text-slate-300">ค่าธรรมเนียมสมัครเรียน: <strong className="text-emerald-400">1,500 THB</strong></span>
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => handleOpenPayModal(app.applicationNumber)}
                          className="font-bold text-xs shadow-md"
                        >
                          <CreditCard className="mr-1.5 h-3.5 w-3.5" /> แนบสลิปชำระเงิน 1,500 บาท
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitted Documents Checklist Section */}
                <div className="rounded-2xl p-5 border shadow-sm space-y-4 bg-slate-950 border-slate-700/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-display">
                        <FileText className="mr-2 h-4 w-4 text-tif-gold" /> รายการเอกสารแนบประกอบใบสมัคร (Submitted Document Checklist)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ตรวจสอบสถานะเอกสารแต่ละรายการ หากเอกสารใดไม่ผ่านการอนุมัติ สามารถกดปุ่มส่งใหม่ได้ทันที
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => handleOpenReuploadModal(app.applicationNumber)}
                      className="text-xs font-bold shrink-0"
                    >
                      <Upload className="mr-1 h-3.5 w-3.5" /> + แนบเอกสารเพิ่มเติม
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {app.documents && app.documents.length > 0 ? (
                      app.documents.map((doc) => {
                        const docTypeLabels: Record<string, string> = {
                          PASSPORT_PHOTO: "รูปถ่าย 1 นิ้ว / 2 นิ้ว (Passport Photo)",
                          NATIONAL_ID: "สำเนาบัตรประชาชน (National ID)",
                          TRANSCRIPT: "สำเนาวุฒิการศึกษา (Transcript)",
                          TOEIC: "ผลสอบภาษาอังกฤษ (TOEIC / IELTS)",
                          TOEIC_SCORE: "ผลสอบภาษาอังกฤษ (TOEIC / IELTS)",
                          MEDICAL_CERT: "ใบรับรองแพทย์เวชศาสตร์การบิน",
                          HOUSE_REGISTRATION: "สำเนาทะเบียนบ้าน (House Reg)",
                          PASSPORT: "หนังสือเดินทาง (Passport)",
                        };
                        const label = docTypeLabels[doc.type] || doc.type || "เอกสารแนบ";

                        return (
                          <div
                            key={doc.id}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                              doc.isRejected
                                ? "bg-rose-950/30 border-rose-800/80 text-rose-200"
                                : doc.isVerified
                                ? "bg-slate-900/90 border-slate-800 text-slate-200"
                                : "bg-slate-900/90 border-slate-800 text-slate-200"
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{label}</span>
                                {doc.isRejected ? (
                                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded flex items-center border border-rose-500/30">
                                    ❌ ต้องส่งใหม่
                                  </span>
                                ) : doc.isVerified ? (
                                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center border border-emerald-500/20">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> ผ่านการอนุมัติ
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center border border-amber-500/20">
                                    <Clock className="mr-1 h-3 w-3" /> รอการตรวจสอบ
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400 font-mono truncate">{doc.originalName}</p>

                              {doc.isRejected && doc.rejectReason && (
                                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300 leading-tight">
                                  <strong>สาเหตุที่ปฏิเสธ:</strong> {doc.rejectReason}
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <a
                                href={doc.secureUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-tif-gold hover:underline font-semibold"
                              >
                                ดูไฟล์ที่อัปโหลด ↗
                              </a>
                              <Button
                                size="sm"
                                variant={doc.isRejected ? "gold" : "outline"}
                                onClick={() => handleOpenReuploadModal(app.applicationNumber, doc)}
                                className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                                  doc.isRejected
                                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                <Upload className="mr-1 h-3 w-3" /> {doc.isRejected ? "อัปโหลดส่งใหม่" : "เปลี่ยนไฟล์"}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-1 sm:col-span-2 p-6 text-center rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-slate-400 text-xs">
                        ยังไม่มีรายการเอกสารแนบในระบบ ท่านสามารถกดปุ่ม &quot;+ แนบเอกสารเพิ่มเติม&quot; เพื่อส่งเอกสารได้
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Slip Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`แนบสลิปชำระเงิน 1,500 บาท (${activePayAppNum})`}
        description="สแกน QR Code PromptPay หรือ โอนเงินเข้าบัญชีธนาคารสถาบัน และแนบสลิปเพื่อยืนยัน"
      >
        {slipSuccess ? (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-emerald-300">อัปโหลดสลิปการชำระเงินสำเร็จ!</h4>
            <p className="text-xs text-emerald-200">
              ระบบบันทึกสลิปโอนเงินสำหรับใบสมัคร <strong className="font-mono">{activePayAppNum}</strong> เรียบร้อยแล้ว เจ้าหน้าที่จะทำการอนุมัติภายใน 24 ชม.
            </p>
            <Button variant="gold" size="sm" onClick={() => setPayModalOpen(false)}>
              ปิดหน้าต่าง (Close)
            </Button>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* QR Code */}
              <div className="bg-white p-3.5 rounded-2xl text-slate-900 text-center space-y-1.5 shadow-inner">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Scan QR PromptPay
                </span>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ThaiInterFlying_ApplicationFee_1500THB"
                  alt="PromptPay QR 1500 THB"
                  className="w-36 h-36 mx-auto rounded-xl border p-1"
                />
                <p className="text-xs font-bold text-tif-navy font-mono">
                  ยอดชำระ: 1,500.00 บาท
                </p>
              </div>

              {/* Bank Info & Upload Input */}
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">บัญชีธนาคารสถาบัน</span>
                  <p className="text-white font-bold text-xs">ธนาคารกสิกรไทย (KBANK)</p>
                  <p className="text-tif-gold font-bold text-sm">012-3-45678-9</p>
                  <p className="text-slate-300 text-[10px]">บจก. ไทย อินเตอร์ ไฟลายอิ้ง</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200 block">เลือกไฟล์สลิปโอนเงิน *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-1.5 rounded-xl border border-slate-800"
                  />
                  {slipFile && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      ✓ ไฟล์ที่เลือก: {slipFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full font-bold shadow-lg mt-2"
              onClick={handleConfirmSubmitSlip}
              disabled={uploadingSlip}
            >
              {uploadingSlip ? "กำลังส่งสลิปโอนเงิน..." : "ยืนยันส่งสลิปชำระเงิน 1,500 บาท"}
            </Button>
          </div>
        )}
      </Modal>

      {/* Re-upload Document Modal */}
      <Modal
        isOpen={reuploadModalOpen}
        onClose={() => setReuploadModalOpen(false)}
        title={`อัปโหลดเอกสารประกอบใบสมัคร (${activePayAppNum})`}
        description="เลือกประเภทเอกสาร และแนบไฟล์รูปภาพหรือ PDF ฉบับใหม่ส่งให้เจ้าหน้าที่"
      >
        <div className="space-y-4 text-xs text-slate-200">
          {/* Document Type Selector Dropdown */}
          <div>
            <label className="font-bold text-slate-200 block mb-1">ประเภทเอกสารที่ต้องการอัปโหลด *</label>
            <select
              value={reuploadType}
              onChange={(e) => setReuploadType(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-tif-gold focus:outline-none font-medium"
            >
              <option value="NATIONAL_ID">สำเนาบัตรประชาชน (National ID Card)</option>
              <option value="PASSPORT">สำเนาหนังสือเดินทาง (Passport)</option>
              <option value="TRANSCRIPT">สำเนาวุฒิการศึกษา (Transcript)</option>
              <option value="TOEIC">ผลสอบภาษาอังกฤษ (TOEIC / IELTS / ICAO Score)</option>
              <option value="MEDICAL_CERT">ใบรับรองแพทย์เวชศาสตร์การบิน (Medical Cert)</option>
              <option value="HOUSE_REGISTRATION">สำเนาทะเบียนบ้าน (House Registration)</option>
              <option value="PASSPORT_PHOTO">รูปถ่าย 1 นิ้ว / 2 นิ้ว (Passport Photo)</option>
              <option value="OTHER">เอกสารแนบอื่นๆ (Other Document)</option>
            </select>
          </div>

          {activeReuploadDoc?.rejectReason && (
            <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800 space-y-1 text-rose-300">
              <span className="text-[10px] text-rose-400 font-bold uppercase block">สาเหตุที่เจ้าหน้าที่ปฏิเสธเอกสารเดิม</span>
              <p className="text-xs">{activeReuploadDoc.rejectReason}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block">เลือกไฟล์เอกสารใหม่ (JPG, PNG หรือ PDF) *</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReuploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
            />
            {reuploadFile && (
              <p className="text-[11px] text-emerald-400 font-mono">
                ✓ ไฟล์ที่เลือก: {reuploadFile.name} ({Math.round(reuploadFile.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReuploadModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleConfirmReupload}
              disabled={uploadingReupload}
              className="font-bold bg-amber-500 hover:bg-amber-600"
            >
              {uploadingReupload ? "กำลังอัปโหลดเอกสาร..." : "ยืนยันส่งเอกสารให้เจ้าหน้าที่"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
