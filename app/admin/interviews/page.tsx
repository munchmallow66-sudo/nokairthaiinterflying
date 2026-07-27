"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, UserCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const INITIAL_INTERVIEWS = [
  {
    id: "int-1",
    candidate: "Somchai Jaidee",
    appNum: "TIF-2026-8812",
    course: "Commercial Pilot License (CPL)",
    interviewer: "Capt. Thanawat (Chief Flight Instructor)",
    location: "Bangkok HQ Room 302 / Zoom",
    date: new Date("2026-07-30T10:00:00"),
    status: "SCHEDULED",
  },
  {
    id: "int-2",
    candidate: "Thanakorn Wong",
    appNum: "TIF-2026-1092",
    course: "ATPL Frozen Ground Theory",
    interviewer: "Capt. Voravit",
    location: "Don Mueang Flight Base",
    date: new Date("2026-07-28T14:00:00"),
    status: "SCHEDULED",
  },
];

import { useLanguage } from "@/lib/i18n/language-context";

export default function InterviewsPage() {
  const { t } = useLanguage();
  const [interviews, setInterviews] = React.useState(INITIAL_INTERVIEWS);

  const handleUpdateEvaluation = (id: string, result: "PASSED" | "FAILED") => {
    setInterviews(
      interviews.map((item) =>
        item.id === id ? { ...item, status: result } : item
      )
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("interviewsTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("interviewsSub")}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interviews.map((item) => (
          <div key={item.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-tif-gold">{item.appNum}</span>
                <h3 className="text-lg font-bold text-white font-display">{item.candidate}</h3>
                <p className="text-xs text-slate-400">{item.course}</p>
              </div>
              <div>
                {item.status === "PASSED" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {t("passedEvaluation")}
                  </span>
                ) : item.status === "FAILED" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    {t("notRecommended")}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {t("scheduledStatus")}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <p className="flex items-center font-mono">
                <Calendar className="mr-2 h-4 w-4 text-tif-gold" /> {formatDateTime(item.date)}
              </p>
              <p className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4 text-purple-400" /> {t("interviewerLabel")} {item.interviewer}
              </p>
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-cyan-400" /> {t("locationLabel")} {item.location}
              </p>
            </div>

            {item.status === "SCHEDULED" && (
              <div className="pt-2 flex items-center space-x-3">
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleUpdateEvaluation(item.id, "PASSED")}
                  className="flex-1 justify-center"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> {t("markPassedBtn")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleUpdateEvaluation(item.id, "FAILED")}
                  className="flex-1 justify-center"
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> {t("markFailedBtn")}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
