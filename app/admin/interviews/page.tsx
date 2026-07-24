"use client";

import * as React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, UserCheck, Video } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const INTERVIEWS = [
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

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-tif-navy font-display">
          Interview Schedules & Candidate Assessments
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track chief flight instructor evaluations and student aptitude interviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INTERVIEWS.map((item) => (
          <Card key={item.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-tif-gold uppercase">{item.appNum}</span>
                <h3 className="text-lg font-bold text-tif-navy font-display">{item.candidate}</h3>
              </div>
              <Badge variant="gold">{item.status}</Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-tif-navy" /> {formatDateTime(item.date)}
              </p>
              <p className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4 text-tif-navy" /> Chief Interviewer: {item.interviewer}
              </p>
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-tif-navy" /> Location: {item.location}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
