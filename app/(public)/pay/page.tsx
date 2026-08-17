"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Search,
  Upload,
  FileText,
  Building,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { compressImageIfNeeded } from "@/lib/image-compressor";
import { useApplicationContext } from "@/lib/context/application-context";

export default function PaymentPage() {
  const { t } = useLanguage();
  const { applications: ctxApps, updateApplication } = useApplicationContext();
  const [appNumber, setAppNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundApp, setFoundApp] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [slipUploadError, setSlipUploadError] = useState(false);
  const [joinOpenHouse, setJoinOpenHouse] = useState<boolean | null>(null);
  const [openHouseAttendees, setOpenHouseAttendees] = useState(1);

  const handleSearchApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFoundApp(null);
    setJoinOpenHouse(null);
    setUploadSuccess(false);

    const cleanInput = appNumber.trim();
    if (!cleanInput) {
      setErrorMsg("กรุณากรอกหมายเลขใบสมัคร (เช่น TIF-2026-1973) หรือเลขบัตรประชาชน 13 หลัก");
      return;
    }

    setSearching(true);

    // 1. Search in local ApplicationContext first
    const upperInput = cleanInput.toUpperCase();
    const digitsInput = cleanInput.replace(/\D/g, "");

    const matchedApp = ctxApps.find((app) => {
      if (app.applicationNumber && app.applicationNumber.toUpperCase() === upperInput) return true;
      if (digitsInput && app.student?.nationalId === digitsInput) return true;
      if (digitsInput && app.student?.phone === digitsInput) return true;
      return false;
    });

    let alreadyUploaded = false;
    let studentName = "สมชาย ใจดี (Somchai Jaidee)";
    let phone = "081-999-8888";
    let appNum = upperInput.includes("TIF") ? upperInput : `TIF-2026-8812`;
    let statusText = "รอชำระค่าสมัคร 1,800 บาท";
    let remarksText = "";

    if (matchedApp) {
      appNum = matchedApp.applicationNumber || appNum;
      if (matchedApp.student) {
        const s = matchedApp.student;
        studentName = `${s.title || ""} ${s.firstNameTh || s.firstNameEn || ""} ${s.lastNameTh || s.lastNameEn || ""}`.trim();
        if (s.firstNameEn || s.lastNameEn) {
          studentName += ` (${s.firstNameEn || ""} ${s.lastNameEn || ""})`.trim();
        }
        phone = s.phone || phone;
      }
      remarksText = matchedApp.remarks || "";

      // Check if slip was uploaded for this application
      const isPaidStatus = [
        "PAYMENT_PENDING",
        "PAID",
        "PAYMENT_VERIFIED",
        "APPLICATION_FEE_PAID",
        "OPEN_HOUSE_ATTENDED",
        "PHYSICAL_DOCS_SUBMITTED",
        "WRITTEN_EXAM",
        "WRITTEN_EXAM_PASSED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_PASSED",
        "MEDICAL_CHECK_CLASS_1",
        "ACCEPTANCE_CONFIRMED",
        "ACCEPTED",
        "ENROLLED",
      ].includes(matchedApp.status);

      const hasSlipRemark =
        matchedApp.remarks?.includes("สลิป") ||
        matchedApp.remarks?.includes("Slip") ||
        matchedApp.remarks?.includes("โอนเงิน") ||
        matchedApp.remarks?.includes("เรียบร้อยแล้ว");

      if (isPaidStatus || hasSlipRemark) {
        alreadyUploaded = true;
        statusText = (matchedApp.status as string) === "PAID" || (matchedApp.status as string) === "PAYMENT_VERIFIED"
          ? "ชำระค่าสมัครเรียบร้อยแล้ว (อนุมัติแล้ว)"
          : "ได้รับสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ)";
      }
    }

    // 2. Ask the server whether a slip is already on file. The payments table is
    //    the authority here — the context above is only this device's cache, so
    //    it cannot answer for an applicant who paid from another browser, and it
    //    holds nothing at all for someone who searched by national ID. That gap
    //    is what kept showing the upload form to applicants who had already paid.
    let serverAnswered = false;
    try {
      const res = await fetch(`/api/payments?slipCheck=${encodeURIComponent(cleanInput)}`);
      if (res.ok) {
        const info = await res.json();
        if (info?.found) {
          serverAnswered = true;
          // Use the real application number, not the guess made above: a slip
          // posted against a fabricated number never reaches the applicant's
          // record, so the next search would invite them to upload yet again.
          if (info.appNum) {
            appNum = info.appNum;
          }
          if (info.hasSlip) {
            alreadyUploaded = true;
            statusText =
              info.paymentStatus === "VERIFIED"
                ? "ชำระค่าสมัครเรียบร้อยแล้ว (อนุมัติแล้ว)"
                : "ได้รับสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ)";
          }
        }
      }
    } catch (err) {
      console.warn("Slip status lookup failed:", err);
    }

    // Fallback only for when the lookup could not answer (database unreachable),
    // where the in-memory payment store may still know about this slip.
    if (!serverAnswered && !alreadyUploaded) {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const payments = await res.json();
          if (Array.isArray(payments)) {
            const foundPayment = payments.find(
              (p: any) => p.appNum && p.appNum.toUpperCase() === appNum.toUpperCase()
            );
            if (foundPayment) {
              alreadyUploaded = true;
              statusText = foundPayment.status === "VERIFIED"
                ? "ชำระค่าสมัครเรียบร้อยแล้ว (อนุมัติแล้ว)"
                : "ได้รับสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ)";
            }
          }
        }
      } catch (err) {
        console.warn("Payment fetch check failed:", err);
      }
    }

    setTimeout(() => {
      setSearching(false);
      setFoundApp({
        appNum,
        studentName,
        phone,
        status: statusText,
        amount: 1800,
        hasUploadedSlip: alreadyUploaded,
        remarks: remarksText,
        joinOpenHouse: matchedApp?.joinOpenHouse ?? null,
      });
      if (matchedApp?.joinOpenHouse !== undefined) {
        setJoinOpenHouse(matchedApp.joinOpenHouse);
      }
    }, 600);
  };

  const handleUploadSlip = async () => {
    if (joinOpenHouse === null) {
      alert("กรุณาเลือกความประสงค์เข้าร่วมงาน Open House ก่อนกดยืนยัน");
      return;
    }
    if (!slipFile) {
      alert("กรุณาเลือกไฟล์สลิปโอนเงิน (JPG, PNG หรือ PDF)");
      return;
    }
    setUploading(true);
    setSlipUploadError(false);

    try {
      const slipDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error || new Error("Failed to read slip file"));
        reader.readAsDataURL(slipFile);
      });

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNum: foundApp?.appNum || "TIF-2026-1973",
          studentName: foundApp?.studentName || "สมชาย ใจดี",
          amount: 1800,
          slipUrl: slipDataUrl,
        }),
      });

      let responseData: any = null;
      try {
        responseData = await res.json();
      } catch {
        responseData = null;
      }

      // Already on file server-side (stale tab, back button, double submit).
      // Not an error to the applicant — show them the paid state instead.
      if (res.status === 409 || responseData?.alreadySubmitted) {
        setUploading(false);
        setFoundApp((prev: any) =>
          prev
            ? {
                ...prev,
                hasUploadedSlip: true,
                status: "ได้รับสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ)",
              }
            : prev
        );
        alert(
          responseData?.error ||
            "ระบบได้รับสลิปโอนเงินของใบสมัครนี้เรียบร้อยแล้ว ไม่ต้องแนบสลิปซ้ำอีก"
        );
        return;
      }

      if (!res.ok || responseData?.success === false) {
        throw new Error(responseData?.error || `Upload failed with status ${res.status}`);
      }

      const openHouseRemarks = joinOpenHouse
        ? ` | ลงทะเบียนเข้าร่วมงาน Open House วันที่ 19 ก.ย. 2569 (จำนวน ${openHouseAttendees} ท่าน)`
        : ` | ไม่ประสงค์เข้าร่วมงาน Open House`;

      setTimeout(() => {
        setUploading(false);
        setUploadSuccess(true);

        if (foundApp?.appNum) {
          updateApplication(foundApp.appNum, {
            remarks: `ได้รับสลิปโอนเงินเรียบร้อยแล้ว${openHouseRemarks} เจ้าหน้าที่จะทำการตรวจสอบและอนุมัติใบสมัครภายใน 24 ชม.`,
            joinOpenHouse: joinOpenHouse,
          });
        }

        setFoundApp((prev: any) =>
          prev ? { ...prev, hasUploadedSlip: true, status: "ได้รับสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ)" } : prev
        );

        alert(`อัปโหลดสลิปสำเร็จ! ระบบได้ผูกสลิปโอนเงินเข้ากับใบสมัคร ${foundApp?.appNum} และส่งไปยังหน้า Admin เรียบร้อยแล้ว`);
      }, 1200);
    } catch (e) {
      console.warn("Slip upload failed:", e);
      setUploading(false);
      setSlipUploadError(true);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-[#f5f5f5] text-slate-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="ambient-orb absolute top-[15%] left-1/2 -translate-x-1/2 w-[52rem] h-[52rem] bg-[radial-gradient(closest-side,rgba(200,162,74,0.15),transparent_100%)]" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-tif-gold/10 text-tif-gold border border-tif-gold/30 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-tif-gold" />
            <span>Thai Inter Flying Admission Payment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            ชำระค่าธรรมเนียมสมัครเรียน 1,800 บาท
          </h1>
          <p className="text-sm max-w-xl mx-auto text-slate-300 font-medium">
            กรอกหมายเลขใบสมัคร (Application Number) หรือเลขบัตรประชาชนเพื่อค้นหาและแนบสลิปชำระเงิน
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSearchApp} className="space-y-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300">
              ค้นหาใบสมัครของคุณ (Search Your Application)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value)}
                placeholder="กรอกหมายเลขใบสมัคร เช่น TIF-2026-1973 หรือเลขบัตรประชาชน"
                className="flex-1 rounded-2xl px-5 py-3.5 text-sm sm:text-base font-mono font-semibold bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
              />
              <Button type="submit" variant="gold" size="lg" disabled={searching} className="font-bold sm:w-auto w-full">
                {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 mr-1" />}
                ค้นหาใบสมัคร
              </Button>
            </div>
            {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}
          </form>
        </div>

        {/* Found Application Details & Payment Box */}
        {foundApp && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-400">
            {/* Candidate Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono">หมายเลขใบสมัคร: <strong className="text-tif-gold text-sm font-mono">{foundApp.appNum}</strong></span>
                <h3 className="text-xl font-bold text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-tif-gold" /> {foundApp.studentName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> {foundApp.phone}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">ยอดเงินค่าสมัคร</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">1,800 THB</span>
              </div>
            </div>

            {uploadSuccess || foundApp.hasUploadedSlip ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-emerald-300">อัปโหลดสลิปการชำระเงินเรียบร้อยแล้ว</h4>
                  <p className="text-xs text-emerald-200/90 max-w-md mx-auto">
                    ระบบบันทึกสลิปโอนเงินค่าสมัคร 1,800 บาทของใบสมัคร <strong className="font-mono text-tif-gold">{foundApp.appNum}</strong> เรียบร้อยแล้ว ไม่จำเป็นต้องอัปโหลดสลิปซ้ำ เจ้าหน้าที่จะทำการตรวจสอบและอนุมัติใบสมัครภายใน 24 ชม.
                  </p>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-left max-w-lg mx-auto space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">สถานะการชำระเงิน:</span>
                    <span className="font-bold text-emerald-400">{foundApp.status || "ได้รับสลิปเรียบร้อย (อยู่ระหว่างรอตรวจสอบ)"}</span>
                  </div>
                  {foundApp.joinOpenHouse !== null && foundApp.joinOpenHouse !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">ลงทะเบียน Open House:</span>
                      <span className="font-semibold text-tif-gold">
                        {foundApp.joinOpenHouse ? "มีความประสงค์เข้าร่วมงาน Open House (19 ก.ย. 2569)" : "ไม่ประสงค์เข้าร่วมงาน Open House"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/track">
                    <Button variant="gold" size="md" className="font-bold">
                      <Search className="h-4 w-4 mr-1.5" />
                      ติดตามสถานะใบสมัคร (Track Application)
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    className="text-slate-300 border-slate-700 hover:bg-slate-800"
                    onClick={() => {
                      setFoundApp(null);
                      setAppNumber("");
                      setUploadSuccess(false);
                    }}
                  >
                    ค้นหาใบสมัครอื่น
                  </Button>
                </div>
              </div>
            ) : (
              /* Payment Methods & Upload Slip Form */
              <div className="space-y-4 text-xs">
                {/* Bank Account */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      โอนเงินผ่านบัญชีธนาคาร (INSTITUTE BANK ACCOUNTS)
                    </span>
                    <span className="text-[11px] font-bold text-tif-gold">ยอดชำระ: 1,800.00 THB</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* SCB */}
                    <div className="bg-purple-950/30 p-3 rounded-xl border border-purple-900/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-purple-300 font-bold text-xs">ธนาคารไทยพาณิชย์ (SCB)</p>
                        <span className="text-[9px] text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-700/50">
                          ออมทรัพย์
                        </span>
                      </div>
                      <p className="text-tif-gold font-bold text-base tracking-wider">202-280661-2</p>
                      <p className="text-slate-300 text-[10px]">ชื่อบัญชี: บริษัท ไทย อินเตอร์ ไฟลอิ้ง จำกัด</p>
                    </div>

                    {/* KBANK */}
                    <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-emerald-400 font-bold text-xs">ธนาคารกสิกรไทย (KBANK)</p>
                        <span className="text-[9px] text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                          ออมทรัพย์
                        </span>
                      </div>
                      <p className="text-tif-gold font-bold text-base tracking-wider">012-3-45678-9</p>
                      <p className="text-slate-300 text-[10px]">ชื่อบัญชี: บจก. ไทย อินเตอร์ ไฟลายอิ้ง</p>
                    </div>
                  </div>
                </div>

                {/* Open House Registration Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 shadow-md">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    การเข้าร่วมงาน OPEN HOUSE (NOK AIR CADET PILOT PROGRAM)
                  </span>

                  <div className="space-y-2">
                    {/* Radio 1: YES */}
                    <label className="flex items-start space-x-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition">
                      <input
                        type="radio"
                        name="openHouseChoicePay"
                        checked={joinOpenHouse === true}
                        onChange={() => setJoinOpenHouse(true)}
                        className="w-4 h-4 mt-0.5 border-slate-700 bg-slate-900 text-tif-gold focus:ring-tif-gold accent-tif-gold shrink-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          มีความประสงค์เข้าร่วมงาน Open House (Nok Air Cadet Pilot Program)
                        </span>
                        <span className="text-[11px] text-amber-400/90 font-medium block mt-0.5">
                          * จำกัดผู้เข้าร่วมสูงสุด 2 ท่าน ต่อ 1 การลงทะเบียน
                        </span>
                      </div>
                    </label>

                    {/* Event Details when YES is selected */}
                    {joinOpenHouse && (
                      <div className="ml-6 p-3 rounded-xl bg-slate-900/90 border border-tif-gold/30 space-y-2 text-xs text-slate-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <p className="flex items-center text-slate-200">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-tif-gold shrink-0" />
                            <span><strong>Date:</strong> 19 September 2026</span>
                          </p>
                          <p className="flex items-center text-slate-200">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-tif-gold shrink-0" />
                            <span><strong>Time:</strong> 09:00 - 15:00 PM</span>
                          </p>
                        </div>

                        <p className="flex items-start text-slate-200">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-tif-gold shrink-0 mt-0.5" />
                          <span>
                            <strong>Location:</strong> Best Western Plus Wanda Grand Hotel Chaengwattana, 5th Floor, Ballroom A
                          </span>
                        </p>

                        <div className="pt-1">
                          <a
                            href="https://maps.app.goo.gl/Dou74zVtK9MWUbW18"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] font-bold text-tif-gold hover:underline bg-tif-gold/10 px-2.5 py-1 rounded-lg border border-tif-gold/30"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            ดูแผนที่ Google Maps ↗
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Radio 2: NO */}
                    <label className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition">
                      <input
                        type="radio"
                        name="openHouseChoicePay"
                        checked={joinOpenHouse === false}
                        onChange={() => setJoinOpenHouse(false)}
                        className="w-4 h-4 border-slate-700 bg-slate-900 text-tif-gold focus:ring-tif-gold accent-tif-gold shrink-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-300">
                        ไม่ประสงค์เข้าร่วมงาน Open House
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">แนบสลิปโอนเงิน (Upload Payment Slip - Auto Compress to 5MB) *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      let selected = e.target.files?.[0];
                      if (!selected) return;

                      if (selected.size > 5 * 1024 * 1024 && selected.type.startsWith("image/")) {
                        selected = await compressImageIfNeeded(selected, 5 * 1024 * 1024);
                      }

                      if (selected.size > 5 * 1024 * 1024) {
                        alert("ขนาดไฟล์สลิปเกิน 5MB กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB");
                        e.target.value = "";
                        setSlipFile(null);
                        return;
                      }
                      setSlipFile(selected);
                    }}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
                  />
                  <span className="text-[11px] text-slate-400 block">รองรับไฟล์ JPG, PNG, PDF (รูปภาพขนาดใหญ่จะถูกย่อขนาดลงให้อัตโนมัติไม่เกิน 5MB)</span>
                  {slipFile && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      ✓ เลือกไฟล์: {slipFile.name} ({Math.round(slipFile.size / 1024)} KB)
                    </p>
                  )}
                </div>

                {slipUploadError && (
                  <p className="text-xs text-rose-400 font-semibold">
                    {t("slipUploadErrorTitle")} — {t("slipUploadErrorDesc")}
                  </p>
                )}

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUploadSlip}
                  disabled={joinOpenHouse === null || !slipFile || uploading}
                >
                  {uploading
                    ? "กำลังส่งสลิป..."
                    : joinOpenHouse === null && !slipFile
                    ? "กรุณาเลือกความประสงค์ Open House และแนบสลิปโอนเงิน"
                    : joinOpenHouse === null
                    ? "กรุณาเลือกความประสงค์เข้าร่วมงาน Open House"
                    : !slipFile
                    ? "กรุณาแนบไฟล์สลิปโอนเงินก่อนกดยืนยัน"
                    : "ยืนยันส่งสลิปค่าสมัคร 1,800 บาท"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
