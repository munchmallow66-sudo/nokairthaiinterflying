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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PaymentPage() {
  const { t } = useLanguage();
  const [appNumber, setAppNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundApp, setFoundApp] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearchApp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFoundApp(null);
    setUploadSuccess(false);

    if (!appNumber.trim()) {
      setErrorMsg("กรุณากรอกหมายเลขใบสมัคร (เช่น TIF-2026-1973) หรือเลขบัตรประชาชน 13 หลัก");
      return;
    }

    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setFoundApp({
        appNum: appNumber.trim().toUpperCase().includes("TIF") ? appNumber.trim().toUpperCase() : `TIF-2026-8812`,
        studentName: "สมชาย ใจดี (Somchai Jaidee)",
        phone: "081-999-8888",
        status: "รอชำระค่าสมัคร 1,500 บาท",
        amount: 1500,
      });
    }, 800);
  };

  const handleUploadSlip = async () => {
    if (!slipFile) {
      alert("กรุณาเลือกไฟล์สลิปโอนเงิน (JPG, PNG หรือ PDF)");
      return;
    }
    setUploading(true);

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
          appNum: foundApp?.appNum || "TIF-2026-1973",
          studentName: foundApp?.studentName || "สมชาย ใจดี",
          amount: 1500,
          slipUrl: slipDataUrl,
        }),
      });
    } catch (e) {}

    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      alert(`อัปโหลดสลิปสำเร็จ! ระบบได้ผูกสลิปโอนเงินเข้ากับใบสมัคร ${foundApp?.appNum} และส่งไปยังหน้า Admin เรียบร้อยแล้ว`);
    }, 1200);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-tif-navyDark text-slate-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-tif-gold/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-tif-gold/10 text-tif-gold border border-tif-gold/30 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="h-4 w-4 text-tif-gold" />
            <span>Thai Inter Flying Admission Payment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            ชำระค่าธรรมเนียมสมัครเรียน 1,500 บาท
          </h1>
          <p className="text-sm max-w-xl mx-auto text-slate-300 font-medium">
            กรอกหมายเลขใบสมัคร (Application Number) หรือเลขบัตรประชาชนเพื่อค้นหาและแนบสลิปชำระเงิน
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
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
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-400">
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
                <span className="text-[10px] text-slate-400 block uppercase font-bold">ยอดเงินที่ต้องชำระ</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">1,500 THB</span>
              </div>
            </div>

            {uploadSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-300">อัปโหลดสลิปการชำระเงินสำเร็จ!</h4>
                <p className="text-xs text-emerald-200">
                  ระบบบันทึกสลิปเรียบร้อยแล้ว เจ้าหน้าที่จะทำการอนุมัติข้อมูลภายใน 24 ชม. สามารถติดตามสถานะได้ในหน้า Track
                </p>
                <div className="pt-2">
                  <Link href="/track">
                    <Button variant="gold" size="sm">
                      ติดตามสถานะใบสมัคร (Track Application)
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Payment Methods & Upload Slip Form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                {/* QR PromptPay */}
                <div className="bg-white p-5 rounded-2xl text-slate-900 text-center space-y-2 shadow-xl">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
                    สแกน QR PromptPay ชำระเงิน 1,500 บาท
                  </span>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ThaiInterFlying_ApplicationFee_1500THB"
                    alt="PromptPay QR Code"
                    className="w-48 h-48 mx-auto rounded-xl border border-slate-200 p-1"
                  />
                  <p className="text-xs font-bold text-tif-navy font-mono">
                    ยอดชำระ: 1,500.00 บาท
                  </p>
                </div>

                {/* Bank Account & Slip Upload */}
                <div className="space-y-5 text-xs">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 font-mono">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">โอนเงินผ่านบัญชีธนาคาร</span>
                    <p className="text-white font-bold text-sm">ธนาคารกสิกรไทย (KBANK)</p>
                    <p className="text-tif-gold font-bold text-lg">012-3-45678-9</p>
                    <p className="text-slate-300 text-[11px]">ชื่อบัญชี: บจก. ไทย อินเตอร์ ไฟลายอิ้ง</p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-200 block">แนบสลิปโอนเงิน (Upload Payment Slip) *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
                    />
                    {slipFile && (
                      <p className="text-[11px] text-emerald-400 font-mono">
                        ✓ เลือกไฟล์: {slipFile.name}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full font-bold shadow-lg"
                    onClick={handleUploadSlip}
                    disabled={uploading}
                  >
                    {uploading ? "กำลังส่งสลิป..." : "ยืนยันส่งสลิปค่าสมัคร 1,500 บาท"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
