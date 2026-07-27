"use client";

import * as React from "react";
import { ShieldAlert, Terminal, Lock, Search, Cpu, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const AUDIT_LOGS = [
  {
    id: "aud-1",
    user: "Somchai Jaidee (Student Cadet)",
    action: "CREATE_APPLICATION",
    resource: "Application (TIF-2026-8812)",
    ip: "182.52.10.45",
    status: "SUCCESS",
    date: new Date("2026-07-24T09:12:00"),
  },
  {
    id: "aud-2",
    user: "Admin Officer (admin@tif.ac.th)",
    action: "VERIFY_DOCUMENT",
    resource: "Document (PASSPORT_PHOTO)",
    ip: "203.150.20.12",
    status: "SUCCESS",
    date: new Date("2026-07-24T10:05:00"),
  },
  {
    id: "aud-3",
    user: "Finance Officer (finance@tif.ac.th)",
    action: "APPROVE_PAYMENT",
    resource: "Payment (INV-2026-0091)",
    ip: "203.150.20.14",
    status: "SUCCESS",
    date: new Date("2026-07-24T11:30:00"),
  },
  {
    id: "aud-4",
    user: "System Automated Auth",
    action: "AUTHENTICATE_OFFICER",
    resource: "Session (admin@tif.ac.th)",
    ip: "127.0.0.1",
    status: "SUCCESS",
    date: new Date("2026-07-26T09:50:00"),
  },
];

import { useLanguage } from "@/lib/i18n/language-context";

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredLogs = AUDIT_LOGS.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("auditLogsTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("auditLogsSub")}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchAuditLogsPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-tif-gold focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <Cpu className="h-4 w-4 text-tif-gold" />
          <span>{t("realtimeLogger")}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">{t("timestampHeader")}</th>
                <th className="px-5 py-4">{t("userActorHeader")}</th>
                <th className="px-5 py-4">{t("actionTypeHeader")}</th>
                <th className="px-5 py-4">{t("resourceTargetHeader")}</th>
                <th className="px-5 py-4">{t("ipAddressHeader")}</th>
                <th className="px-5 py-4 text-right">{t("statusHeader")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 text-slate-400">
                    {formatDateTime(log.date)}
                  </td>
                  <td className="px-5 py-4 font-sans font-semibold text-white">{log.user}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-950 text-tif-gold border border-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-cyan-400 font-sans font-medium">{log.resource}</td>
                  <td className="px-5 py-4 text-slate-400">{log.ip}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center text-emerald-400 font-sans font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
