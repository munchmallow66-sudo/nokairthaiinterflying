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

  const handleOpenPayModal = (appNum: string) => {
    setActivePayAppNum(appNum);
    setSlipFile(null);
    setSlipSuccess(false);
    setPayModalOpen(true);
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

                      {/* Payment Action Button */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
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
    </div>
  );
}
