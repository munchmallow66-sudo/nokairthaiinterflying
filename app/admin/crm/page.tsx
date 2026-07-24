"use client";

import * as React from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, Mail, Calendar, MessageSquare, Plus, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const CRM_TIMELINE = [
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

export default function CRMPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-tif-navy font-display">
            Aviation Student CRM & Timeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Call history, email communications, meeting notes, and candidate follow-ups
          </p>
        </div>
        <Button variant="gold">
          <Plus className="mr-1.5 h-4 w-4" /> Log CRM Interaction
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 space-y-6">
          <CardTitle>Activity Timeline</CardTitle>
          <div className="divide-y divide-slate-100">
            {CRM_TIMELINE.map((item) => (
              <div key={item.id} className="py-4 flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-tif-gold">
                  {item.type === "Call Log" ? (
                    <PhoneCall className="h-5 w-5" />
                  ) : item.type === "Email Sent" ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-tif-navy uppercase">{item.type}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.student}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.notes}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block">Logged by: {item.officer}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <CardTitle>Follow-Up Reminders</CardTitle>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center">
                <Clock className="mr-1 h-3.5 w-3.5 text-amber-600" /> Call Back: Somchai Jaidee
              </span>
              <p className="text-amber-800">Confirm receipt of Class 1 Medical Certificate from Bangkok Hospital.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
