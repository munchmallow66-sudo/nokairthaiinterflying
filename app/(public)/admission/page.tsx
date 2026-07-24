import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdmissionPage() {
  return (
    <div className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          Admission Guidelines
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          Student Admission & Entry Requirements
        </h1>
        <p className="text-slate-600 text-lg">
          Review candidate eligibility criteria and prepare your digital application documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-tif-gold" /> General Entry Requirements
          </h3>
          <ul className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Age Qualification:</strong> Minimum 17 years old for PPL, 18 years old for CPL.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Education Standard:</strong> High School Diploma (Mathayom 6), GED, or Bachelor&apos;s Degree.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Medical Certificate:</strong> CAAT Class 1 Medical Fitness Certificate (for CPL) or Class 2 (for PPL).</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-3 h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>English Proficiency:</strong> TOEIC score 650+ or ICAO Aviation English Level 4 recommended.</span>
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
            <FileText className="mr-2 h-6 w-6 text-tif-gold" /> Required Digital Documents
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>1. Official 1.5-inch Passport Photograph</li>
            <li>2. Thai National ID Card or International Passport</li>
            <li>3. House Registration Copy (Tabien Baan)</li>
            <li>4. Official High School or University Academic Transcript</li>
            <li>5. Graduation Degree Certificate</li>
            <li>6. CAAT Aviation Medical Certificate</li>
            <li>7. Official TOEIC / IELTS Test Report</li>
          </ul>
          <div className="pt-4 border-t border-slate-100">
            <Link href="/apply">
              <Button variant="gold" className="w-full">
                Begin Online Application Form <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
