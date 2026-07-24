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
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminDashboardPage() {
  const { t } = useLanguage();

  const [stats, setStats] = React.useState({
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
      name: "Somchai Jaidee",
      course: "Commercial Pilot License (CPL)",
      status: "SUBMITTED",
      date: "2026-07-24",
    },
    {
      id: "app-2",
      appNum: "TIF-2026-4401",
      name: "Kanchana Sukhumvit",
      course: "Private Pilot License (PPL)",
      status: "DOCUMENT_VERIFIED",
      date: "2026-07-23",
    },
    {
      id: "app-3",
      appNum: "TIF-2026-1092",
      name: "Thanakorn Wong",
      course: "ATPL Frozen Ground Theory",
      status: "INTERVIEW_SCHEDULED",
      date: "2026-07-22",
    },
    {
      id: "app-4",
      appNum: "TIF-2026-9043",
      name: "Nattapong Kittisak",
      course: "Commercial Pilot License (CPL)",
      status: "PAID",
      date: "2026-07-21",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-tif-navy font-display">
            {t("adminDashboardTitle")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("adminDashboardSub")}
          </p>
        </div>
        <Link href="/admin/applications">
          <Button variant="gold">
            <FileText className="mr-2 h-4 w-4" /> {t("adminNavApplications")}
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 border-l-4 border-l-tif-navy">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Today Apps</span>
            <div className="p-2 bg-blue-50 text-tif-navy rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-tif-navy font-display mt-2">
            {stats.todayApplications}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-0.5" /> +25% from yesterday
          </span>
        </Card>

        <Card className="p-5 border-l-4 border-l-tif-gold">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Monthly Apps</span>
            <div className="p-2 bg-amber-50 text-tif-gold rounded-lg">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-tif-navy font-display mt-2">
            {stats.monthlyApplications}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-0.5" /> +12% target pace
          </span>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-tif-navy font-display mt-2">
            {formatCurrency(stats.revenue)}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
            Verified Payments
          </span>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Pending Slips</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-tif-navy font-display mt-2">
            {stats.pendingPayments}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
            Requires Finance Action
          </span>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Interviews</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-tif-navy font-display mt-2">
            {stats.upcomingInterviews}
          </p>
          <span className="text-[10px] text-purple-600 font-semibold mt-1 block">
            Scheduled this week
          </span>
        </Card>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications List */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div>
              <CardTitle>Recent Cadet Applications</CardTitle>
              <CardDescription>Latest submissions awaiting document verification</CardDescription>
            </div>
            <Link href="/admin/applications" className="text-xs font-semibold text-tif-gold hover:underline flex items-center">
              View All <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApplications.map((app) => (
              <div key={app.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-tif-navy">{app.appNum}</span>
                  <p className="text-sm font-semibold text-slate-800">{app.name}</p>
                  <p className="text-xs text-slate-400">{app.course}</p>
                </div>
                <div className="text-right">
                  <Badge variant={app.status === "PAID" ? "success" : app.status === "INTERVIEW_SCHEDULED" ? "gold" : "info"}>
                    {app.status}
                  </Badge>
                  <p className="text-[10px] text-slate-400 mt-1">{formatDate(app.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions & System Status */}
        <Card className="p-6 space-y-6">
          <CardTitle>Academy Operations</CardTitle>

          <div className="space-y-3">
            <Link href="/admin/applications" className="block">
              <Button variant="outline" className="w-full justify-start text-xs">
                <FileText className="mr-2 h-4 w-4 text-tif-gold" /> Verify Student Documents
              </Button>
            </Link>
            <Link href="/admin/payments" className="block">
              <Button variant="outline" className="w-full justify-start text-xs">
                <DollarSign className="mr-2 h-4 w-4 text-emerald-600" /> Verify Bank Payment Slips
              </Button>
            </Link>
            <Link href="/admin/crm" className="block">
              <Button variant="outline" className="w-full justify-start text-xs">
                <Users className="mr-2 h-4 w-4 text-purple-600" /> Log CRM Call & Meeting Notes
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500">System Integration Status</p>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Cloudinary Direct Storage</span>
              <span className="text-emerald-600 font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Microsoft 365 SMTP Mail</span>
              <span className="text-emerald-600 font-semibold">Ready</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Prisma Neon PostgreSQL</span>
              <span className="text-emerald-600 font-semibold">Connected</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
