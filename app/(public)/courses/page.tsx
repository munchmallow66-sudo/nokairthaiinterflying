"use client";

import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { TranslationKey } from "@/lib/i18n/translations";

interface CourseItem {
  id: string;
  code: string;
  nameKey: TranslationKey;
  price: number;
  duration: string;
  descKey: TranslationKey;
  reqKeys: TranslationKey[];
}

const COURSES: CourseItem[] = [
  {
    id: "ppl-001",
    code: "PPL",
    nameKey: "coursePplName",
    price: 350000,
    duration: "4 Months",
    descKey: "coursePplDesc",
    reqKeys: ["coursePplReq1", "coursePplReq2", "coursePplReq3"],
  },
  {
    id: "cpl-002",
    code: "CPL",
    nameKey: "courseCplName",
    price: 1250000,
    duration: "14 Months",
    descKey: "courseCplDesc",
    reqKeys: ["courseCplReq1", "courseCplReq2", "courseCplReq3", "courseCplReq4"],
  },
  {
    id: "atpl-003",
    code: "ATPL",
    nameKey: "courseAtplName",
    price: 180000,
    duration: "6 Months",
    descKey: "courseAtplDesc",
    reqKeys: ["courseAtplReq1", "courseAtplReq2"],
  },
  {
    id: "fi-004",
    code: "FI",
    nameKey: "courseFiName",
    price: 300000,
    duration: "3 Months",
    descKey: "courseFiDesc",
    reqKeys: ["courseFiReq1", "courseFiReq2"],
  },
  {
    id: "type-005",
    code: "TR",
    nameKey: "courseTrName",
    price: 450000,
    duration: "2 Months",
    descKey: "courseTrDesc",
    reqKeys: ["courseTrReq1", "courseTrReq2"],
  },
  {
    id: "me-006",
    code: "ME",
    nameKey: "courseMeName",
    price: 280000,
    duration: "1.5 Months",
    descKey: "courseMeDesc",
    reqKeys: ["courseMeReq1"],
  },
  {
    id: "ir-007",
    code: "IR",
    nameKey: "courseIrName",
    price: 220000,
    duration: "2 Months",
    descKey: "courseIrDesc",
    reqKeys: ["courseIrReq1", "courseIrReq2"],
  },
  {
    id: "eng-008",
    code: "ICAO",
    nameKey: "courseIcaoName",
    price: 45000,
    duration: "1 Month",
    descKey: "courseIcaoDesc",
    reqKeys: ["courseIcaoReq1"],
  },
];

export default function CoursesPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          {t("coursesEyebrow")}
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          {t("coursesTitle")}
        </h1>
        <p className="text-slate-600">
          {t("coursesDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COURSES.map((course) => (
          <div
            key={course.id}
            className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-tif-gold transition duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-tif-gold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {course.code}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5 text-slate-400" /> {course.duration}
                </span>
              </div>

              <h3 className="text-lg font-bold text-tif-navy font-display mb-2">
                {t(course.nameKey)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t(course.descKey)}
              </p>

              <div className="space-y-1.5 mb-6">
                <p className="text-[11px] font-bold text-slate-700 uppercase">{t("prerequisitesLabel")}</p>
                {course.reqKeys.map((reqKey, idx) => (
                  <div key={idx} className="flex items-center text-xs text-slate-500">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t(reqKey)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{t("tuitionFeeLabel")}</span>
                <span className="text-base font-bold text-tif-navy">
                  {formatCurrency(course.price)}
                </span>
              </div>
              <Link href="/apply">
                <Button variant="gold" size="sm" className="text-xs">
                  {t("applyCourseBtn")} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

