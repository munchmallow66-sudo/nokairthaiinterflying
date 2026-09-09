"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  DollarSign,
  Calendar,
  Users,
  UserRound,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PILOT_WORKFLOW_STEPS } from "@/types";
import { useLanguage } from "@/lib/i18n/language-context";

interface DashboardStats {
  totalApplications: number;
  todayApplications: number;
  genders: { male: number; female: number; unspecified: number };
  verifiedPaymentCount: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingInterviews: number;
  recentApplications: any[];
}

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.warn("Failed fetching dashboard statistics:", err));
  }, []);

  const todayAppsCount = stats?.todayApplications || 0;
  const totalAppsCount = stats?.totalApplications || 0;
  const genderCounts = stats?.genders || { male: 0, female: 0, unspecified: 0 };
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingPaymentsCount = stats?.pendingPayments || 0;
  const upcomingInterviewsCount = stats?.upcomingInterviews || 0;
  const recentApplications = stats?.recentApplications || [];

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
            สำหรับเจ้าหน้าที่ตรวจสอบความถูกต้องของข้อมูลใบสมัครและติดตามความคืบหน้า 13 ขั้นตอนเส้นทางนักบิน
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

      {/* Real-time Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Today Apps */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("todayAppsLabel")}</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-3">
            {todayAppsCount}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" /> Real-time Sync
          </span>
        </div>

        {/* Total Apps */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("monthlyCadetsLabel")}</span>
            <div className="p-2.5 bg-tif-gold/10 text-tif-gold rounded-xl border border-tif-gold/20 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-3">
            {totalAppsCount}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center mt-2">
            <TrendingUp className="h-3 w-3 mr-1" /> ใบสมัครทั้งหมด
          </span>
        </div>

        {/* Gender Split */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("genderSplitLabel")}</span>
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 group-hover:scale-110 transition-transform">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display mt-3 font-mono flex items-baseline gap-1.5">
            <span className="text-sky-400">{genderCounts.male}</span>
            <span className="text-xl text-slate-600">/</span>
            <span className="text-pink-400">{genderCounts.female}</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            {t("genderSplitCaption")}
            {genderCounts.unspecified > 0 && (
              <span className="text-amber-400"> · {t("genderUnspecifiedShort")} {genderCounts.unspecified}</span>
            )}
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
          <p className="text-xl font-bold text-white font-display mt-3 truncate font-mono">
            {totalRevenue > 0 ? `${totalRevenue.toLocaleString()} THB` : "0 THB"}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-2 block">
            {stats?.verifiedPaymentCount || 0} สลิปที่อนุมัติแล้ว
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
          <p className="text-3xl font-bold text-white font-display mt-3 font-mono">
            {pendingPaymentsCount}
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
          <p className="text-3xl font-bold text-white font-display mt-3 font-mono">
            {upcomingInterviewsCount}
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
              <p className="text-xs text-slate-400">รายการใบสมัครศิษย์บิน 8 ขั้นตอนที่ยื่นเข้ามาในระบบแบบ Real-time</p>
            </div>
            <Link href="/admin/applications" className="text-xs font-semibold text-tif-gold hover:underline flex items-center">
              {t("viewAllApplications")} <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentApplications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">ยังไม่มีรายการใบสมัครในระบบ</div>
            ) : (
              recentApplications.map((app) => {
                const name = `${app.student?.firstNameTh || app.student?.firstNameEn || "ผู้สมัคร"} ${app.student?.lastNameTh || app.student?.lastNameEn || ""}`.trim();
                const dateStr = app.createdAt ? new Date(app.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

                return (
                  <div key={app.id} className="py-4 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-xl transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-tif-gold font-mono">{app.applicationNumber}</span>
                        <span className="text-slate-600">•</span>
                        <p className="text-sm font-semibold text-slate-100">{name}</p>
                      </div>
                      <p className="text-xs text-slate-400">{app.course?.name || "Commercial Pilot License (CPL)"}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div>{getStatusBadge(app.status)}</div>
                      <p className="text-[11px] font-mono text-slate-500">{formatDate(dateStr)}</p>
                    </div>
                  </div>
                );
              })
            )}
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
                <FileText className="mr-2.5 h-4 w-4 text-tif-gold" /> ตรวจสอบแบบฟอร์มสมัคร & เอกสาร
              </Button>
            </Link>
            <Link href="/admin/payments" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-200 h-11 rounded-xl">
                <DollarSign className="mr-2.5 h-4 w-4 text-emerald-400" /> ตรวจสอบสลิปโอนเงินค่าสมัคร 1,800 บาท
              </Button>
            </Link>
            <Link href="/admin/interviews" className="block">
              <Button variant="outline" className="w-full justify-start text-xs bg-slate-950/60 border-slate-800 hover:border-purple-500/40 text-slate-200 h-11 rounded-xl">
                <Calendar className="mr-2.5 h-4 w-4 text-purple-400" /> จัดการและประเมินผลการสอบสัมภาษณ์
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
                <span className="text-cyan-400 font-semibold text-[11px]">8 ขั้นตอน</span>
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
