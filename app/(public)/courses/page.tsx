import Link from "next/link";
import { Plane, Clock, DollarSign, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const COURSES = [
  {
    id: "ppl-001",
    code: "PPL",
    name: "Private Pilot License",
    price: 350000,
    duration: "4 Months",
    description: "Fundamental pilot training covering aerodynamics, solo flight, flight navigation, and single-engine handling.",
    requirements: ["Age 17+", "High School Graduation", "CAAT Class 2 Medical"],
  },
  {
    id: "cpl-002",
    code: "CPL",
    name: "Commercial Pilot License",
    price: 1250000,
    duration: "14 Months",
    description: "Professional pilot training required for commercial airline careers, including night flight and cross-country operations.",
    requirements: ["Age 18+", "PPL License", "CAAT Class 1 Medical", "TOEIC 650+"],
  },
  {
    id: "atpl-003",
    code: "ATPL",
    name: "ATPL Frozen Ground Theory",
    price: 180000,
    duration: "6 Months",
    description: "Advanced airline theory covering 14 subjects: Jet Systems, Meteorology, Flight Planning, Air Law, and Navigation.",
    requirements: ["CPL/PPL License", "Strong Physics & Math Foundations"],
  },
  {
    id: "fi-004",
    code: "FI",
    name: "Flight Instructor Rating",
    price: 300000,
    duration: "3 Months",
    description: "Pedagogical flight teaching methodology to certify pilots as certified flight instructors.",
    requirements: ["CPL License", "Minimum 200 Flight Hours"],
  },
  {
    id: "type-005",
    code: "TR",
    name: "Type Rating Prep (Airbus A320)",
    price: 450000,
    duration: "2 Months",
    description: "Jet transition course focused on Airbus A320 FFS simulator procedures, glass cockpit automation, and MCC.",
    requirements: ["CPL + IR + ME", "ATPL Theory Pass"],
  },
  {
    id: "me-006",
    code: "ME",
    name: "Multi-Engine Rating",
    price: 280000,
    duration: "1.5 Months",
    description: "Multi-engine aircraft aerodynamics, asymmetric engine failure drills, and Diamond DA42 flight hours.",
    requirements: ["PPL or CPL License"],
  },
  {
    id: "ir-007",
    code: "IR",
    name: "Instrument Rating",
    price: 220000,
    duration: "2 Months",
    description: "Precision flight strictly by cockpit instruments under IMC weather conditions and ILS instrument approaches.",
    requirements: ["PPL or CPL License", "50 Hours Cross-Country"],
  },
  {
    id: "eng-008",
    code: "ICAO",
    name: "English for Aviation (Level 4+)",
    price: 45000,
    duration: "1 Month",
    description: "Radio telephony phraseology and ICAO English test preparation for pilot certification.",
    requirements: ["Basic English Communication"],
  },
];

export default function CoursesPage() {
  return (
    <div className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          CAAT Approved Programs
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          Flight Academy Courses & Ratings
        </h1>
        <p className="text-slate-600">
          Explore our certified pilot license programs engineered for commercial airline recruitment standards.
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
                {course.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {course.description}
              </p>

              <div className="space-y-1.5 mb-6">
                <p className="text-[11px] font-bold text-slate-700 uppercase">Prerequisites:</p>
                {course.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center text-xs text-slate-500">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Tuition Fee</span>
                <span className="text-base font-bold text-tif-navy">
                  {formatCurrency(course.price)}
                </span>
              </div>
              <Link href="/apply">
                <Button variant="gold" size="sm" className="text-xs">
                  Apply <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
