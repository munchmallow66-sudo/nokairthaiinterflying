"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PhoneCall, Mail, Calendar, MessageSquare, Plus, Clock, Users, UserCheck, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

const INITIAL_CRM_TIMELINE = [
  {
    id: "crm-1",
    type: "Call Log",
    student: "Somchai Jaidee (TIF-2026-8812)",
    notes: "Spoke with father regarding CPL tuition payment options. Advised on bank wire transfer.",
    officer: "Sales Officer Anan",
    date: new Date("2026-07-24T14:30:00"),
  },
  {
    id: "crm-2",
    type: "Email Sent",
    student: "Kanchana Sukhumvit (TIF-2026-4401)",
    notes: "Automated document verification receipt dispatched via Microsoft 365 SMTP.",
    officer: "System Automated",
    date: new Date("2026-07-23T11:15:00"),
  },
  {
    id: "crm-3",
    type: "Meeting Note",
    student: "Thanakorn Wong (TIF-2026-1092)",
    notes: "In-person campus tour conducted at Don Mueang Flight Base. Candidate demonstrated high enthusiasm.",
    officer: "Training Officer Prasert",
    date: new Date("2026-07-22T09:45:00"),
  },
];

import { useLanguage } from "@/lib/i18n/language-context";

export default function CRMPage() {
  const { t } = useLanguage();
  const [timeline, setTimeline] = React.useState(INITIAL_CRM_TIMELINE);
  const [isLogModalOpen, setIsLogModalOpen] = React.useState(false);
  const [logType, setLogType] = React.useState("Call Log");
  const [studentName, setStudentName] = React.useState("");
  const [logNotes, setLogNotes] = React.useState("");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !logNotes) return;

    const newLog = {
      id: `crm_${Date.now()}`,
      type: logType,
      student: studentName,
      notes: logNotes,
      officer: "Academy Officer",
      date: new Date(),
    };

    setTimeline([newLog, ...timeline]);
    setStudentName("");
    setLogNotes("");
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
              {t("crmTag")}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("crmTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("crmSub")}
          </p>
        </div>
        <Button variant="gold" onClick={() => setIsLogModalOpen(true)} className="shadow-lg shadow-tif-gold/10 font-semibold">
          <Plus className="mr-1.5 h-4 w-4" /> {t("logCrmInteractionBtn")}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">{t("totalLeadsEngaged")}</p>
            <p className="text-2xl font-bold text-white font-display">42 Cadets</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">{t("followupsScheduled")}</p>
            <p className="text-2xl font-bold text-white font-display">18 High Priority</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">{t("conversionRate")}</p>
            <p className="text-2xl font-bold text-white font-display">68% Success</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Timeline List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display">{t("interactionTimelineTitle")}</h2>
              <p className="text-xs text-slate-400">Chronological history of interactions</p>
            </div>
            <span className="text-xs text-tif-gold font-mono">{timeline.length} Logs recorded</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {timeline.map((item) => (
              <div key={item.id} className="py-4 flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-tif-gold shadow-md">
                  {item.type === "Call Log" ? (
                    <PhoneCall className="h-4 w-4 text-tif-gold" />
                  ) : item.type === "Email Sent" ? (
                    <Mail className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-tif-gold uppercase tracking-wider">{item.type}</span>
                    <span className="text-[11px] font-mono text-slate-500">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{item.student}</p>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 mt-1">
                    {item.notes}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">Logged by: {item.officer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-Up Reminders */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-display">{t("followupsScheduled")}</h2>
            <p className="text-xs text-slate-400">Scheduled officer tasks & action items</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-amber-300 block flex items-center">
                <Clock className="mr-1.5 h-4 w-4 text-amber-400" /> Call Back: Somchai Jaidee
              </span>
              <p className="text-amber-200/90 leading-relaxed">
                Confirm receipt of Class 1 Medical Certificate from Bangkok Hospital.
              </p>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-cyan-300 block flex items-center">
                <Calendar className="mr-1.5 h-4 w-4 text-cyan-400" /> Campus Tour: Kanchana
              </span>
              <p className="text-cyan-200/90 leading-relaxed">
                Demonstrate Cessna 172 Simulator at Don Mueang Training Hangar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Log Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={t("logModalTitle")}
        description="Record a call, meeting, or email note for a candidate"
      >
        <form onSubmit={handleAddLog} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">{t("logTypeLabel")}</label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            >
              <option value="Call Log">Phone Call Log</option>
              <option value="Meeting Note">In-Person Meeting / Campus Tour</option>
              <option value="Email Sent">Email Communication</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">{t("studentNameRefLabel")}</label>
            <input
              required
              placeholder="e.g. Somchai Jaidee (TIF-2026-8812)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">{t("logDetailsLabel")}</label>
            <textarea
              required
              rows={4}
              placeholder="Describe conversation details, inquiries, or payment agreements..."
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <Button type="submit" variant="gold" className="w-full mt-2">
            {t("saveLogBtn")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
