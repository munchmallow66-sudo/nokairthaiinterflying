"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PILOT_WORKFLOW_STEPS } from "@/types";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();

  const [stats] = React.useState({
    todayApplications: 4,
    monthlyApplications: 28,
    revenue: 4550000,
    pendingPayments: 3,
    upcomingInterviews: 5,
  });

  const recentApplications = [
    {
      id: "app-1",
      appNum: "TIF-2026-8812",
      name: "Somchai Jaidee (สมชาย ใจดี)",
      feeInfo: "ค่าสมัครเรียน 1,800 บาท",
      status: "SUBMITTED",
      date: "2026-07-24",
    },
    {
      id: "app-2",
      appNum: "TIF-2026-4401",
      name: "Kanchana Sukhumvit (กาญจนา สุขุมวิท)",
      feeInfo: "ค่าสมัครเรียน 1,800 บาท",
      status: "DOCS_PASSED",
      date: "2026-07-23",
    },
    {
      id: "app-3",
      appNum: "TIF-2026-1092",
      name: "Thanakorn Wong (ธนกร วงศ์)",
      feeInfo: "ค่าสมัครเรียน 1,800 บาท",
      status: "INTERVIEW_SCHEDULED",
      date: "2026-07-22",
    },
    {
      id: "app-4",
      appNum: "TIF-2026-9043",
      name: "Nattapong Kittisak (ณัฐพงษ์ กิตติศักดิ์)",
      feeInfo: "ค่าสมัครเรียน 1,800 บาท",
      status: "APPLICATION_FEE_PAID",
      date: "2026-07-21",
    },
  ];

  const getStatusBadge = (status: string) => {
    const stepDef = PILOT_WORKFLOW_STEPS.find((s) => s.key === status);
    if (stepDef) {
      const title = language === "th" ? stepDef.titleTh : stepDef.titleEn;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${stepDef.badgeClass}`}>
          <CheckCircle2 className="w-3 h-3 mr-1" /> {stepDef.step}. {title}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3 h-3 mr-1" /> {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-slate-400 font-mono">Intake 2026</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight">
            ระบบตรวจเช็กและจัดการแบบฟอร์มสมัครเรียนการบินออนไลน์
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            สำหรับเจ้าหน้าที่ตรวจสอบความถูกต้องของข้อมูลใบสมัครและติดตามความคืบหน้า 17 ขั้นตอนเส้นทางนักบิน
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link href="/admin/applications">
            <Button variant="gold" size="md" className="shadow-lg shadow-tif-gold/10 font-semibold">
              <FileText className="mr-2 h-4 w-4" /> {t("adminNavApplications")}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today Apps */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("todayAppsLabel")}</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-3">
            {stats.todayApplications}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" /> +25%
          </span>
        </div>

        {/* Monthly Apps */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("monthlyCadetsLabel")}</span>
            <div className="p-2.5 bg-tif-gold/10 text-tif-gold rounded-xl border border-tif-gold/20 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-3">
            {stats.monthlyApplications}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" /> Target Pace
          </span>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ยอดรวมค่าสมัคร 1,800 บาท</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-white font-display mt-3 truncate">
            42,000 THB
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            28 สลิปที่อนุมัติแล้ว
          </span>
        </div>

        {/* Pending Slips */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("pendingSlipsLabel")}</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-3">
            {stats.pendingPayments}
          </p>
          <span className="text-[11px] text-amber-400 font-medium mt-2 block">
            รอตรวจสอบสลิป
          </span>
        </div>

        {/* Interviews */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("upcomingInterviewsLabel")}</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-3">
            {stats.upcomingInterviews}
          </p>
          <span className="text-[11px] text-purple-400 font-medium mt-2 block">
            นัดสัมภาษณ์แล้ว
          </span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display">รายการใบสมัครล่าสุด (Recent Cadet Applications)</h2>
              <p className="text-xs text-slate-400">รายการใบสมัครศิษย์บิน 9 ขั้นตอนที่ยื่นเข้ามาในระบบ</p>
            </div>
            <Link href="/admin/applications" className="text-xs font-semibold text-tif-gold hover:underline flex items-center">
              {t("viewAllApplications")} <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentApplications.map((app) => (
              <div key={app.id} className="py-4 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-xl transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-tif-gold font-mono">{app.appNum}</span>
                    <span className="text-slate-600">•</span>
                    <p className="text-sm font-semibold text-slate-100">{app.name}</p>
                  </div>
                  <p className="text-xs text-slate-400">{app.feeInfo}</p>
                </div>
                <div className="text-right space-y-1">
                  <div>{getStatusBadge(app.status)}</div>
                  <p className="text-[11px] font-mono text-slate-500">{formatDate(app.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Officer Verification Checklist Console */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-display">{t("quickOfficerActionsTitle")}</h2>
            <p className="text-xs text-slate-400">เมนูดำเนินการด่วนสำหรับเจ้าหน้าที่</p>
          </div>

          <div className="space-y-3">
            <Link href="/admin/applications" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-950/60 border-slate-800 hover:border-tif-gold/40 text-slate-200 h-11 rounded-xl">
                <FileText className="mr-2.5 h-4 w-4 text-tif-gold" /> ตรวจสอบแบบฟอร์มสมัคร & เอกสาร 9 ขั้นตอน
              </Button>
            </Link>
            <Link href="/admin/payments" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-200 h-11 rounded-xl">
                <DollarSign className="mr-2.5 h-4 w-4 text-emerald-400" /> ตรวจสอบสลิปโอนเงินค่าสมัคร 1,800 บาท
              </Button>
            </Link>
          </div>

          {/* Admission Checklist Overview */}
          <div className="pt-5 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-tif-gold" /> ข้อกำหนดการรับสมัคร
              </span>
              <span className="text-[10px] font-mono text-tif-gold">Thai Inter Flying</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-200 font-medium">ค่าธรรมเนียมสมัครเรียน</span>
                <span className="text-emerald-400 font-semibold text-[11px]">1,800 THB</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-200 font-medium">แบบฟอร์มสมัครออนไลน์</span>
                <span className="text-cyan-400 font-semibold text-[11px]">9 ขั้นตอน</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-200 font-medium">การตรวจร่างกาย / สัมภาษณ์</span>
                <span className="text-purple-400 font-semibold text-[11px]">เวชศาสตร์การบิน</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
