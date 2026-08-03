"use client";

import * as React from "react";
import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
  MessageSquare,
  PenTool,
  CreditCard,
  Upload,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { PILOT_WORKFLOW_STEPS } from "@/types";
import { compressImageIfNeeded } from "@/lib/image-compressor";
import { useApplicationContext } from "@/lib/context/application-context";
import { formatDocumentFileName } from "@/lib/utils";


interface ApplicationData {
  id: string;
  applicationNumber: string;
  courseName: string;
  status: string;
  statusLabelTh: string;
  statusLabelEn: string;
  submissionDate: string;
  stepIndex: number;
  remarks: string;
  updatedAt: string;
  documents?: {
    id: string;
    type: string;
    secureUrl: string;
    originalName: string;
    isVerified: boolean;
    isRejected?: boolean;
    rejectReason?: string;
  }[];
}

interface TrackingResponse {
  found: boolean;
  studentName?: string;
  nationalId?: string;
  applications?: ApplicationData[];
  error?: string;
}

const getDocTypeLabel = (type: string, t: (key: any) => string): string => {
  const map: Record<string, string> = {
    PASSPORT_PHOTO: t("docPassportPhoto"),
    NATIONAL_ID: t("docNationalId"),
    TRANSCRIPT: t("docTranscript"),
    TOEIC: t("docToeic"),
    TOEIC_SCORE: t("docToeic"),
    MEDICAL_CERT: t("docMedicalCert"),
    HOUSE_REGISTRATION: t("docHouseRegistration"),
    PASSPORT: t("docPassport"),
    OTHER: t("docOther"),
  };
  return map[type] || type || t("docOther");
};

export default function TrackStatusPage() {
  const { t, language } = useLanguage();
  const { applications: ctxApps } = useApplicationContext();
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAllDocsMap, setShowAllDocsMap] = useState<Record<string, boolean>>({});

  // Payment Slip Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activePayAppNum, setActivePayAppNum] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipSuccess, setSlipSuccess] = useState(false);

  // Re-upload Document Modal States
  const [reuploadModalOpen, setReuploadModalOpen] = useState(false);
  const [activeReuploadDoc, setActiveReuploadDoc] = useState<any>(null);
  const [reuploadType, setReuploadType] = useState("NATIONAL_ID");
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [uploadingReupload, setUploadingReupload] = useState(false);

  const handleOpenPayModal = (appNum: string) => {
    setActivePayAppNum(appNum);
    setSlipFile(null);
    setSlipSuccess(false);
    setPayModalOpen(true);
  };

  const handleOpenReuploadModal = (appNum: string, doc?: any) => {
    setActivePayAppNum(appNum);
    setActiveReuploadDoc(doc || null);
    setReuploadType(doc?.type || "NATIONAL_ID");
    setReuploadFile(null);
    setReuploadModalOpen(true);
  };

  const handleConfirmReupload = () => {
    if (!reuploadFile) {
      alert(t("selectDocAlert"));
      return;
    }
    setUploadingReupload(true);

    setTimeout(() => {
      setUploadingReupload(false);
      setReuploadModalOpen(false);

      if (result && result.applications) {
        setResult({
          ...result,
          applications: result.applications.map((a) =>
            a.applicationNumber === activePayAppNum
              ? {
                  ...a,
                  status: "SUBMITTED",
                  statusLabelTh: "อัปโหลดเอกสารฉบับใหม่เรียบร้อยแล้ว (รอเจ้าหน้าที่ตรวจสอบ)",
                  statusLabelEn: "New document uploaded successfully (Pending Staff Verification)",
                  remarks: `ส่งเอกสารใหม่ "${reuploadFile.name}" เข้าสู่ระบบเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบอีกครั้ง`,
                  documents: [
                    ...(a.documents?.filter((d) => d.id !== activeReuploadDoc?.id) || []),
                    {
                      id: activeReuploadDoc?.id || `doc_${Date.now()}`,
                      type: reuploadType,
                      secureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
                      originalName: formatDocumentFileName(
                        activePayAppNum,
                        "",
                        result?.studentName?.split(" ")[0] || "",
                        reuploadType,
                        reuploadFile.name
                      ),
                      isVerified: false,
                      isRejected: false,
                    },
                  ],
                }
              : a
          ),
        });
      }
      alert(t("reuploadSuccessAlert"));
    }, 1200);
  };

  const handleConfirmSubmitSlip = async () => {
    if (!slipFile) {
      alert(t("selectSlipAlert"));
      return;
    }
    setUploadingSlip(true);

    try {
      const slipDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(slipFile);
      });

      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNum: activePayAppNum || "TIF-2026-1973",
          studentName: result?.studentName || "Somchai Jaidee",
          amount: 1800,
          slipUrl: slipDataUrl,
        }),
      });
    } catch (e) {}

    setTimeout(() => {
      setUploadingSlip(false);
      setSlipSuccess(true);
      if (result && result.applications) {
        setResult({
          ...result,
          applications: result.applications.map((a) =>
            a.applicationNumber === activePayAppNum
              ? {
                  ...a,
                  statusLabelTh: "อัปโหลดสลิป 1,800 บาทเรียบร้อยแล้ว (เจ้าหน้ากำลังตรวจสอบ)",
                  statusLabelEn: "Payment slip 1,800 THB uploaded (Staff reviewing)",
                  remarks: "ได้รับสลิปโอนเงินเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและอนุมัติใบสมัครภายใน 24 ชม.",
                }
              : a
          ),
        });
      }
      alert(`${t("slipSuccessAlert")} (${activePayAppNum})`);
    }, 1200);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const queryValue = nationalId.trim();
    if (!queryValue) {
      setErrorMsg(t("trackSearchInputErr"));
      return;
    }

    setLoading(true);
    setResult(null);

    // 1. Search from ApplicationContext (localStorage) first
    const queryUpper = queryValue.toUpperCase();
    const queryDigits = queryValue.replace(/\D/g, "");

    const localMatches = ctxApps.filter((app) => {
      // Match by application number
      if (app.applicationNumber?.toUpperCase() === queryUpper) return true;
      // Match by national ID
      if (queryDigits.length > 0 && app.student?.nationalId === queryDigits) return true;
      // Match by phone
      if (queryDigits.length > 0 && app.student?.phone === queryDigits) return true;
      return false;
    });

    if (localMatches.length > 0) {
      const firstMatch = localMatches[0];
      const student = firstMatch.student;
      const studentName = student
        ? `${student.title || ""} ${student.firstNameTh || student.firstNameEn || ""} ${student.lastNameTh || student.lastNameEn || ""} (${student.firstNameEn || ""} ${student.lastNameEn || ""})`.trim()
        : "ไม่ทราบชื่อ";

      const getStatusInfo = (status: string) => {
        switch (status) {
          case "ONLINE_REGISTRATION":
            return { stepIndex: 1, labelTh: "1/17: เปิดรับสมัครออนไลน์", labelEn: "1/17: Online Registration Open" };
          case "SUBMITTED":
            return { stepIndex: 2, labelTh: "2/17: ยื่นใบสมัครเรียบร้อยแล้ว (รอตรวจเอกสาร)", labelEn: "2/17: Application Submitted" };
          case "DOCS_UNDER_REVIEW":
          case "WAITING_DOCUMENTS":
            return { stepIndex: 3, labelTh: "3/17: อยู่ระหว่างการตรวจเอกสารเบื้องต้น", labelEn: "3/17: Document Review in Progress" };
          case "DOCS_PASSED":
          case "DOCUMENT_VERIFIED":
            return { stepIndex: 4, labelTh: "4/17: ผ่านการตรวจเอกสาร (พร้อมชำระค่าสมัคร 1,800 บาท)", labelEn: "4/17: Docs Passed (Ready for Payment)" };
          case "APPLICATION_FEE_PAID":
          case "PAID":
          case "PAYMENT_PENDING":
            return { stepIndex: 5, labelTh: "5/17: ชำระค่าสมัคร 1,800 บาทเรียบร้อยแล้ว", labelEn: "5/17: Application Fee Paid" };
          case "OPEN_HOUSE_ATTENDED":
            return { stepIndex: 6, labelTh: "6/17: เข้าร่วมกิจกรรม Open House เรียบร้อยแล้ว", labelEn: "6/17: Open House Attended" };
          case "PHYSICAL_DOCS_SUBMITTED":
            return { stepIndex: 7, labelTh: "7/17: ส่งเอกสารตัวจริงให้เจ้าหน้าที่เรียบร้อยแล้ว", labelEn: "7/17: Physical Documents Submitted" };
          case "WRITTEN_EXAM":
            return { stepIndex: 8, labelTh: "8/17: กำหนดวันสอบข้อเขียน", labelEn: "8/17: Written Exam Scheduled" };
          case "WRITTEN_EXAM_PASSED":
            return { stepIndex: 9, labelTh: "9/17: ผ่านการสอบข้อเขียน", labelEn: "9/17: Written Exam Passed" };
          case "INTERVIEW_SCHEDULED":
            return { stepIndex: 10, labelTh: "10/17: กำหนดวันสอบสัมภาษณ์", labelEn: "10/17: Interview Scheduled" };
          case "INTERVIEW_PASSED":
            return { stepIndex: 11, labelTh: "11/17: ผ่านการสอบสัมภาษณ์", labelEn: "11/17: Interview Passed" };
          case "MEDICAL_CHECK_CLASS_1":
            return { stepIndex: 12, labelTh: "12/17: เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน", labelEn: "12/17: Class 1 Medical Check" };
          case "ACCEPTANCE_CONFIRMED":
          case "ACCEPTED":
            return { stepIndex: 13, labelTh: "13/17: ยืนยันสิทธิ์เข้าศึกษาเรียบร้อยแล้ว", labelEn: "13/17: Seat Acceptance Confirmed" };
          case "CONTRACT_SIGNED":
            return { stepIndex: 14, labelTh: "14/17: ลงนามสัญญาการฝึกอบรมศิษย์บิน", labelEn: "14/17: Contract Signed" };
          case "TUITION_FIRST_INSTALLMENT_PAID":
            return { stepIndex: 15, labelTh: "15/17: ชำระค่าเรียนงวดแรกเรียบร้อยแล้ว", labelEn: "15/17: 1st Tuition Installment Paid" };
          case "ORIENTATION":
            return { stepIndex: 16, labelTh: "16/17: ปฐมนิเทศศิษย์บินใหม่", labelEn: "16/17: Orientation" };
          case "PILOT_JOURNEY_BEGUN":
          case "ENROLLED":
            return { stepIndex: 17, labelTh: "17/17: เริ่มต้นเส้นทางนักบินอาชีพ! (Pilot Journey Begun)", labelEn: "17/17: Start Pilot Journey!" };
          case "REJECTED":
            return { stepIndex: 0, labelTh: "ไม่ผ่านการคัดเลือก (Rejected)", labelEn: "Application Not Successful" };
          default:
            return { stepIndex: 1, labelTh: "ยื่นใบสมัครแล้ว", labelEn: "Application Submitted" };
        }
      };

      const applications: ApplicationData[] = localMatches.map((app) => {
        const info = getStatusInfo(app.status);
        return {
          id: app.id,
          applicationNumber: app.applicationNumber,
          courseName: "แบบฟอร์มสมัครเรียนการบินออนไลน์ 8 ขั้นตอน",
          status: app.status,
          statusLabelTh: info.labelTh,
          statusLabelEn: info.labelEn,
          submissionDate: app.createdAt ? new Date(app.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          stepIndex: info.stepIndex,
          remarks: "เจ้าหน้าที่กำลังดำเนินการตามลำดับขั้นตอน",
          updatedAt: app.updatedAt ? new Date(app.updatedAt).toLocaleString("th-TH") : "อัปเดตล่าสุดวันนี้",
          documents: (app.documents || []).map((doc: any) => ({
            id: doc.id || `doc_${Date.now()}`,
            type: doc.type,
            secureUrl: doc.secureUrl || "",
            originalName: doc.originalName || doc.type,
            isVerified: doc.isVerified || false,
            isRejected: doc.isRejected || false,
            rejectReason: doc.rejectReason,
          })),
        };
      });

      setResult({
        found: true,
        studentName,
        nationalId: student?.nationalId || queryDigits || "-",
        applications,
      });
      setLoading(false);
      return;
    }

    // 2. Fallback: call API (for DB-backed data)
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryValue, nationalId: queryValue }),
      });

      const data = await res.json();

      if (!res.ok && !data.found) {
        setErrorMsg(data.error || t("trackNotFoundErr"));
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMsg(t("trackConnErr"));
    } finally {
      setLoading(false);
    }
  };

  // Live Real-Time Auto Sync: Listen to Admin updates in ApplicationContext & sync Track view instantly
  React.useEffect(() => {
    if (!result || !result.applications || result.applications.length === 0) return;

    const getStatusInfo = (status: string) => {
      switch (status) {
        case "ONLINE_REGISTRATION": return { stepIndex: 1, labelTh: "1/17: เปิดรับสมัครออนไลน์", labelEn: "1/17: Online Registration Open" };
        case "SUBMITTED": return { stepIndex: 2, labelTh: "2/17: ยื่นใบสมัครเรียบร้อยแล้ว (รอตรวจเอกสาร)", labelEn: "2/17: Application Submitted" };
        case "DOCS_UNDER_REVIEW":
        case "WAITING_DOCUMENTS": return { stepIndex: 3, labelTh: "3/17: อยู่ระหว่างการตรวจเอกสารเบื้องต้น", labelEn: "3/17: Document Review in Progress" };
        case "DOCS_PASSED":
        case "DOCUMENT_VERIFIED": return { stepIndex: 4, labelTh: "4/17: ผ่านการตรวจเอกสาร (พร้อมชำระค่าสมัคร 1,800 บาท)", labelEn: "4/17: Docs Passed (Ready for Payment)" };
        case "APPLICATION_FEE_PAID":
        case "PAID":
        case "PAYMENT_PENDING": return { stepIndex: 5, labelTh: "5/17: ชำระค่าสมัคร 1,800 บาทเรียบร้อยแล้ว", labelEn: "5/17: Application Fee Paid" };
        case "OPEN_HOUSE_ATTENDED": return { stepIndex: 6, labelTh: "6/17: เข้าร่วมกิจกรรม Open House เรียบร้อยแล้ว", labelEn: "6/17: Open House Attended" };
        case "PHYSICAL_DOCS_SUBMITTED": return { stepIndex: 7, labelTh: "7/17: ส่งเอกสารตัวจริงให้เจ้าหน้าที่เรียบร้อยแล้ว", labelEn: "7/17: Physical Documents Submitted" };
        case "WRITTEN_EXAM": return { stepIndex: 8, labelTh: "8/17: กำหนดวันสอบข้อเขียน", labelEn: "8/17: Written Exam Scheduled" };
        case "WRITTEN_EXAM_PASSED": return { stepIndex: 9, labelTh: "9/17: ผ่านการสอบข้อเขียน", labelEn: "9/17: Written Exam Passed" };
        case "INTERVIEW_SCHEDULED": return { stepIndex: 10, labelTh: "10/17: กำหนดวันสอบสัมภาษณ์", labelEn: "10/17: Interview Scheduled" };
        case "INTERVIEW_PASSED": return { stepIndex: 11, labelTh: "11/17: ผ่านการสอบสัมภาษณ์", labelEn: "11/17: Interview Passed" };
        case "MEDICAL_CHECK_CLASS_1": return { stepIndex: 12, labelTh: "12/17: เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน", labelEn: "12/17: Class 1 Medical Check" };
        case "ACCEPTANCE_CONFIRMED":
        case "ACCEPTED": return { stepIndex: 13, labelTh: "13/17: ยืนยันสิทธิ์เข้าศึกษาเรียบร้อยแล้ว", labelEn: "13/17: Seat Acceptance Confirmed" };
        case "CONTRACT_SIGNED": return { stepIndex: 14, labelTh: "14/17: ลงนามสัญญาการฝึกอบรมศิษย์บิน", labelEn: "14/17: Contract Signed" };
        case "TUITION_FIRST_INSTALLMENT_PAID": return { stepIndex: 15, labelTh: "15/17: ชำระค่าเรียนงวดแรกเรียบร้อยแล้ว", labelEn: "15/17: 1st Tuition Installment Paid" };
        case "ORIENTATION": return { stepIndex: 16, labelTh: "16/17: ปฐมนิเทศศิษย์บินใหม่", labelEn: "16/17: Orientation" };
        case "PILOT_JOURNEY_BEGUN":
        case "ENROLLED": return { stepIndex: 17, labelTh: "17/17: เริ่มต้นเส้นทางนักบินอาชีพ! (Pilot Journey Begun)", labelEn: "17/17: Start Pilot Journey!" };
        case "REJECTED": return { stepIndex: 0, labelTh: "ไม่ผ่านการคัดเลือก (Rejected)", labelEn: "Application Not Successful" };
        default: return { stepIndex: 1, labelTh: "ยื่นใบสมัครแล้ว", labelEn: "Application Submitted" };
      }
    };

    const updatedApps = result.applications.map((resApp) => {
      const liveApp = ctxApps.find(
        (a) => a.id === resApp.id || a.applicationNumber === resApp.applicationNumber
      );
      if (!liveApp) return resApp;

      const info = getStatusInfo(liveApp.status);

      let latestRemarks = resApp.remarks;
      if (liveApp.adminNotes && liveApp.adminNotes.length > 0) {
        latestRemarks = liveApp.adminNotes[0].content;
      }

      return {
        ...resApp,
        status: liveApp.status,
        statusLabelTh: info.labelTh,
        statusLabelEn: info.labelEn,
        stepIndex: info.stepIndex,
        remarks: latestRemarks,
        updatedAt: liveApp.updatedAt ? new Date(liveApp.updatedAt).toLocaleString("th-TH") : resApp.updatedAt,
        documents: (liveApp.documents || []).map((doc: any) => ({
          id: doc.id || `doc_${Date.now()}`,
          type: doc.type,
          secureUrl: doc.secureUrl || "",
          originalName: doc.originalName || doc.type,
          isVerified: doc.isVerified || false,
          isRejected: doc.isRejected || false,
          rejectReason: doc.rejectReason,
        })),
      };
    });

    const isDifferent = JSON.stringify(updatedApps) !== JSON.stringify(result.applications);
    if (isDifferent) {
      setResult({
        ...result,
        applications: updatedApps,
      });
    }
  }, [ctxApps, result]);

  const handleUseDemo = () => {
    setNationalId("TIF-2026-1973");
    setErrorMsg("");
  };

  const steps = [
    { icon: CheckCircle2, label: t("step1Label"), subLabel: t("step1SubLabel") },
    { icon: FileText, label: t("step2Label"), subLabel: t("step2SubLabel") },
    { icon: PenTool, label: t("step3Label"), subLabel: t("step3SubLabel") },
    { icon: User, label: t("step4Label"), subLabel: t("step4SubLabel") },
    { icon: Award, label: t("step5Label"), subLabel: t("step5SubLabel") },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f5f5]">
      {/* ================================================================ */}
      {/* HEADER — Editorial style with gold accent                        */}
      {/* ================================================================ */}
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/50 via-[#f5f5f5] to-[#f5f5f5] z-0 pointer-events-none" />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a06_1px,transparent_1px),linear-gradient(to_bottom,#0f172a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-tif-gold/40" />
            <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase">
              {t("trackBadge")}
            </span>
            <span className="h-px w-12 bg-tif-gold/40" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-tif-navy font-display tracking-tight leading-tight">
            {t("trackPageTitle")}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            {t("trackPageSub")}
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SEARCH CARD — Minimal white card                                  */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 w-full -mt-6 relative z-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-luxury space-y-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="nationalId"
                className="text-xs font-bold uppercase tracking-wider text-tif-navy flex items-center"
              >
                <Search className="h-3 w-3 mr-1.5 text-tif-gold" />
                {t("inputSearchLabel")}
              </label>
              <input
                id="nationalId"
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder={t("inputSearchPlaceholder")}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-tif-gold focus:ring-2 focus:ring-tif-gold/20 transition-all font-medium"
              />
            </div>

            {errorMsg && (
              <div className="flex items-start space-x-2.5 p-4 rounded-xl text-xs font-medium border border-rose-200 bg-rose-50 text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                variant="gold"
                size="lg"
                className="flex-1 font-bold shadow-gold"
              >
                {loading ? (
                  <span className="flex items-center space-x-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("searchingBtn")}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>{t("searchStatusBtn")}</span>
                  </span>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleUseDemo}
                variant="outline"
                size="lg"
                className="border-tif-navy/20 text-tif-navy hover:bg-tif-navy hover:text-white font-semibold"
              >
                {t("demoBtnText")}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRACKING RESULTS                                                  */}
      {/* ================================================================ */}
      {result && result.found && result.applications && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full mt-10 pb-24 space-y-6 animate-in fade-in duration-500">
          {/* Result Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-luxury">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-tif-gold" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tif-goldDark block mb-0.5">
                    {t("applicantNameLabel")}
                  </span>
                  <h2 className="text-xl font-extrabold text-tif-navy font-display">
                    {result.studentName}
                  </h2>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-right">
                <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-400">
                  {t("nationalIdLabel")}
                </span>
                <span className="text-sm font-mono font-bold text-tif-navy">
                  {result.nationalId}
                </span>
              </div>
            </div>
          </div>

          {/* Application Cards */}
          {result.applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-luxury space-y-7"
            >
              {/* Course & Application Ref Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border border-tif-gold/30 bg-tif-gold/5 text-tif-goldDark">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{app.applicationNumber}</span>
                  </div>
                  <h3 className="text-lg font-bold text-tif-navy font-display">
                    {app.courseName}
                  </h3>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar className="h-4 w-4 text-tif-gold" />
                  <span>{t("submittedDateLabel")} {app.submissionDate}</span>
                </div>
              </div>

              {/* 8 Essential Student Milestone Timeline */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-[0.15em] text-tif-gold uppercase">
                      {t("progressLabel")} (สถานะขั้นตอนการคัดเลือกนักบิน)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                    ขั้นตอนปัจจุบัน: {app.stepIndex || 1} จาก 17 ({Math.round(((app.stepIndex || 1) / 17) * 100)}%)
                  </span>
                </div>

                {/* Horizontal Stepper Grid (8 Key Milestones) */}
                <div className="relative">
                  {/* Connecting Line behind icons */}
                  <div className="absolute top-5 left-[6%] right-[6%] h-0.5 bg-slate-200 hidden md:block" />
                  <div
                    className="absolute top-5 left-[6%] h-0.5 bg-emerald-500 transition-all duration-500 hidden md:block"
                    style={{
                      width: `${
                        (app.stepIndex || 1) <= 2
                          ? 0
                          : (app.stepIndex || 1) <= 4
                          ? 12
                          : (app.stepIndex || 1) <= 5
                          ? 26
                          : (app.stepIndex || 1) <= 7
                          ? 40
                          : (app.stepIndex || 1) <= 9
                          ? 54
                          : (app.stepIndex || 1) <= 11
                          ? 68
                          : (app.stepIndex || 1) <= 12
                          ? 82
                          : 88
                      }%`,
                    }}
                  />

                  {/* 8 Milestone Items Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10">
                    {[
                      { num: 1, labelTh: "1. ยื่นใบสมัคร", labelEn: "Application", icon: FileText, maxStep: 2 },
                      { num: 2, labelTh: "2. ตรวจเอกสาร", labelEn: "Docs Review", icon: CheckCircle2, maxStep: 4 },
                      { num: 3, labelTh: "3. ชำระค่าสมัคร 1,800 บาท", labelEn: "App Fee (1,800 THB)", icon: CreditCard, maxStep: 5 },
                      { num: 4, labelTh: "4. ส่งเอกสารตัวจริง", labelEn: "Original Docs", icon: Upload, maxStep: 7 },
                      { num: 5, labelTh: "5. สอบข้อเขียน", labelEn: "Written Exam", icon: PenTool, maxStep: 9 },
                      { num: 6, labelTh: "6. สอบสัมภาษณ์", labelEn: "Interview", icon: User, maxStep: 11 },
                      { num: 7, labelTh: "7. ตรวจสุขภาพ Class 1", labelEn: "Medical Check", icon: Award, maxStep: 12 },
                      { num: 8, labelTh: "8. ทำสัญญา & ปฐมนิเทศ", labelEn: "Contract & Start", icon: Sparkles, maxStep: 17 },
                    ].map((milestone) => {
                      const curStep = app.stepIndex || 1;
                      const isComplete = curStep > milestone.maxStep || (milestone.num === 8 && curStep === 17);
                      const isCurrent =
                        (milestone.num === 1 && curStep <= 2) ||
                        (milestone.num === 2 && curStep >= 3 && curStep <= 4) ||
                        (milestone.num === 3 && curStep === 5) ||
                        (milestone.num === 4 && curStep >= 6 && curStep <= 7) ||
                        (milestone.num === 5 && curStep >= 8 && curStep <= 9) ||
                        (milestone.num === 6 && curStep >= 10 && curStep <= 11) ||
                        (milestone.num === 7 && curStep === 12) ||
                        (milestone.num === 8 && curStep >= 13);

                      const Icon = milestone.icon;
                      const isFeeStep = milestone.num === 3;

                      return (
                        <div
                          key={milestone.num}
                          className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                            isCurrent
                              ? isFeeStep
                                ? "bg-amber-50 border-amber-400 text-amber-900 shadow-md ring-2 ring-amber-400/30"
                                : "bg-tif-gold/10 border-tif-gold text-tif-navy shadow-md ring-2 ring-tif-gold/20"
                              : isComplete
                              ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                              : "bg-white border-slate-200 text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all mb-1.5 ${
                              isComplete
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                : isCurrent
                                ? isFeeStep
                                  ? "bg-amber-500 border-amber-500 text-white font-bold animate-pulse shadow-md"
                                  : "bg-tif-gold border-tif-gold text-slate-950 font-bold animate-pulse shadow-md"
                                : "bg-white border-slate-200 text-slate-300"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <p
                            className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                              isCurrent
                                ? isFeeStep
                                  ? "text-amber-800 font-extrabold"
                                  : "text-tif-goldDark font-bold"
                                : isComplete
                                ? "text-tif-navy"
                                : "text-slate-400"
                            }`}
                          >
                            {milestone.labelTh}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 hidden xl:block">
                            {milestone.labelEn}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Detail & Remarks */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("currentStatusLabel")}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {t("lastUpdatedLabel")}: {app.updatedAt}
                  </span>
                </div>

                <div className="text-base font-bold flex items-center gap-2.5 text-tif-navy">
                  <Sparkles className="h-4 w-4 text-tif-gold shrink-0" />
                  <span>{language === "th" ? app.statusLabelTh : app.statusLabelEn}</span>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-white text-sm leading-relaxed text-slate-600 flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-tif-gold" />
                  <div className="w-full space-y-2">
                    <strong className="text-xs font-bold text-tif-navy block">
                      {t("staffRemarksLabel")}
                    </strong>
                    <span className="text-sm">{app.remarks}</span>

                    {/* Document Re-upload Warning */}
                    {(app.status === "WAITING_DOCUMENTS" || app.documents?.some((d) => d.isRejected)) && (
                      <div className="mt-3 p-4 rounded-lg border border-rose-200 bg-rose-50 space-y-3">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs border-b border-rose-200 pb-2.5">
                          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>{t("docReuploadRequiredTitle")}</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {app.documents?.filter((d) => d.isRejected)?.map((doc) => {
                            const label = getDocTypeLabel(doc.type, t);

                            return (
                              <div
                                key={doc.id}
                                className="p-3 bg-white rounded-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-rose-700 text-xs flex items-center">
                                      ❌ {label}
                                    </span>
                                    <span className="text-slate-400 font-mono text-[11px] truncate">({doc.originalName})</span>
                                  </div>
                                  {doc.rejectReason && (
                                    <p className="text-rose-600 text-[11px] bg-rose-50 p-2 rounded border border-rose-200 leading-tight">
                                      <strong>{t("reuploadReasonLabel")}</strong> {doc.rejectReason}
                                    </p>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  variant="gold"
                                  onClick={() => handleOpenReuploadModal(app.applicationNumber, doc)}
                                  className="font-bold text-xs shrink-0"
                                >
                                  <Upload className="mr-1 h-3.5 w-3.5" /> {t("reuploadThisFileBtn")}
                                </Button>
                              </div>
                            );
                          })}

                          {(!app.documents || app.documents.filter((d) => d.isRejected).length === 0) && (
                            <div className="p-3 bg-white rounded-lg border border-rose-200 flex items-center justify-between">
                              <span className="text-slate-600">{t("attachNewFilePrompt")}</span>
                              <Button
                                size="sm"
                                variant="gold"
                                onClick={() => handleOpenReuploadModal(app.applicationNumber)}
                                className="font-bold text-xs shrink-0"
                              >
                                <Upload className="mr-1 h-3.5 w-3.5" /> {t("attachNewFileBtn")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Action — Only shown when application is ready for payment (DOCS_PASSED / DOCUMENT_VERIFIED / step 4) and NOT yet paid/approved */}
                    {(app.status === "DOCUMENT_VERIFIED" || app.status === "DOCS_PASSED" || app.stepIndex === 4) &&
                      app.status !== "APPLICATION_FEE_PAID" &&
                      app.status !== "PAID" &&
                      app.status !== "PAYMENT_PENDING" &&
                      (app.stepIndex || 1) < 5 && (
                        <div className="mt-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50 space-y-3">
                          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs border-b border-emerald-200 pb-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{t("docVerifiedPayPrompt")}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs text-slate-600">
                              {t("applicationFeeLabel")} <strong className="text-emerald-600">1,800 THB</strong>
                            </span>
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() => handleOpenPayModal(app.applicationNumber)}
                              className="font-bold text-xs shadow-gold"
                            >
                              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> {t("attachPaymentSlipBtn")}
                            </Button>
                          </div>
                        </div>
                    )}

                    {/* Pending Slip Verification Notice */}
                    {(app.status === "PAYMENT_PENDING" || app.statusLabelTh?.includes("อัปโหลดสลิป")) && app.status !== "APPLICATION_FEE_PAID" && (app.stepIndex || 1) <= 5 && (
                      <div className="mt-3 p-4 rounded-lg border border-amber-200 bg-amber-50 space-y-2">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                          <Clock className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                          <span>ได้รับสลิปชำระเงิน 1,800 บาทเรียบร้อยแล้ว — อยู่ระหว่างเจ้าหน้าที่ตรวจสอบสลิป</span>
                        </div>
                        <p className="text-xs text-amber-700">
                          เมื่อเจ้าหน้าที่ตรวจสอบและอนุมัติสลิปแล้ว ระบบจะอัปเดตสถานะการสมัครให้อัตโนมัติ
                        </p>
                      </div>
                    )}

                    {/* Approved Payment Banner (Step 5) */}
                    {(app.status === "APPLICATION_FEE_PAID" || app.status === "PAID") && (app.stepIndex || 1) === 5 && (
                      <div className="mt-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50/80 space-y-1">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>ชำระค่าสมัคร 1,800 บาท เรียบร้อยแล้ว (เจ้าหน้าที่อนุมัติสลิปชำระเงินเรียบร้อยแล้ว)</span>
                        </div>
                      </div>
                    )}

                    {/* Rejected / Failed Review Notice */}
                    {(app.status === "REJECTED") && (
                      <div className="mt-3 p-4 rounded-lg border border-rose-200 bg-rose-50 space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs border-b border-rose-200 pb-2.5">
                          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>{t("docRejectedNotice")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted Documents Section — Smart display based on status & completeness */}
              {(() => {
                const docs = app.documents || [];
                const rejectedDocs = docs.filter((d) => d.isRejected);
                const isAllUploadedAndClean = docs.length >= 6 && rejectedDocs.length === 0;
                const showAll = showAllDocsMap[app.id] || false;

                // 1. If all 6 documents are uploaded and none are rejected: show clean green success banner
                if (isAllUploadedAndClean && !showAll) {
                  return (
                    <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-950 font-display">
                            อัปโหลดเอกสารครบถ้วนเรียบร้อยแล้ว ({docs.length}/6 รายการ)
                          </h4>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            เอกสารของคุณแนบเข้าสู่ระบบครบถ้วนแล้ว อยู่ระหว่างเจ้าหน้าที่ตรวจสอบความถูกต้องและอนุมัติใบสมัคร
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAllDocsMap((prev) => ({ ...prev, [app.id]: true }))}
                          className="text-xs font-bold border-emerald-300 text-emerald-900 hover:bg-emerald-100 bg-white"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> ดูเอกสารทั้งหมดที่แนบไว้ ({docs.length})
                        </Button>
                      </div>
                    </div>
                  );
                }

                // 2. If there are rejected docs OR missing docs OR user clicked show all
                const displayedDocs = rejectedDocs.length > 0 && !showAll ? rejectedDocs : docs;

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-tif-gold" />
                        <div>
                          <h4 className="text-xs font-bold text-tif-navy uppercase tracking-wider font-display">
                            {rejectedDocs.length > 0 && !showAll
                              ? `⚠️ เอกสารที่ต้องแก้ไข / ส่งใหม่ (${rejectedDocs.length} รายการ)`
                              : t("attachedDocsTitle")}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {rejectedDocs.length > 0 && !showAll
                              ? "แสดงเฉพาะเอกสารที่เจ้าหน้าที่แจ้งให้ส่งใหม่ กรุณาอัปโหลดไฟล์ทดแทน"
                              : t("attachedDocsSub")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {showAll && isAllUploadedAndClean && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAllDocsMap((prev) => ({ ...prev, [app.id]: false }))}
                            className="text-xs text-slate-500 hover:text-slate-900"
                          >
                            ซ่อนรายการเอกสาร
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReuploadModal(app.applicationNumber)}
                          className="text-xs font-bold shrink-0 border-tif-navy/20 text-tif-navy hover:bg-tif-navy hover:text-white"
                        >
                          <Upload className="mr-1 h-3.5 w-3.5" /> {t("addMoreDocsBtn")}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayedDocs && displayedDocs.length > 0 ? (
                        displayedDocs.map((doc) => {
                          const label = getDocTypeLabel(doc.type, t);

                          return (
                            <div
                              key={doc.id}
                              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                                doc.isRejected
                                  ? "border-rose-200 bg-rose-50"
                                  : doc.isVerified
                                  ? "border-emerald-200 bg-emerald-50/50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-tif-navy text-xs">{label}</span>
                                  {doc.isRejected ? (
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded flex items-center border border-rose-200">
                                      {t("statusReupload")}
                                    </span>
                                  ) : doc.isVerified ? (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded flex items-center border border-emerald-200">
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> {t("statusApproved")}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded flex items-center border border-amber-200">
                                      <Clock className="mr-1 h-3 w-3" /> {t("statusPending")}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-400 font-mono truncate">{doc.originalName}</p>

                                {doc.isRejected && doc.rejectReason && (
                                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-[10px] text-rose-700 leading-tight">
                                    <strong>{t("rejectionReasonLabel")}</strong> {doc.rejectReason}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <a
                                  href={doc.secureUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-tif-goldDark hover:text-tif-gold hover:underline font-semibold"
                                >
                                  {t("viewUploadedFileBtn")}
                                </a>
                                <Button
                                  size="sm"
                                  variant={doc.isRejected ? "gold" : "outline"}
                                  onClick={() => handleOpenReuploadModal(app.applicationNumber, doc)}
                                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                                    doc.isRejected
                                      ? ""
                                      : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-tif-navy"
                                  }`}
                                >
                                  <Upload className="mr-1 h-3 w-3" /> {doc.isRejected ? t("reuploadSubmitBtn") : t("changeFileBtn")}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-1 sm:col-span-2 p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                          {t("noDocsFoundMsg")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </section>
      )}

      {/* ================================================================ */}
      {/* PAYMENT SLIP MODAL                                                */}
      {/* ================================================================ */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`${t("payModalTitle")} (${activePayAppNum})`}
        description={t("payModalDesc")}
        maxWidth="2xl"
      >
        {slipSuccess ? (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-emerald-300">{t("slipUploadSuccessTitle")}</h4>
            <p className="text-xs text-emerald-200">
              {t("slipUploadSuccessDesc")} (<strong className="font-mono">{activePayAppNum}</strong>)
            </p>
            <Button variant="gold" size="sm" onClick={() => setPayModalOpen(false)}>
              {t("closeModalBtn")}
            </Button>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl text-slate-900 text-center space-y-2 shadow-inner">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  {t("scanQrPromptPay")}
                </span>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ThaiInterFlying_ApplicationFee_1800THB"
                  alt="PromptPay QR 1800 THB"
                  className="w-36 h-36 mx-auto rounded-xl border p-1"
                />
                <p className="text-xs font-bold text-tif-navy font-mono">
                  {t("amountToPay")} 1,800.00 THB
                </p>
              </div>

              {/* Bank Info & Upload Input */}
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">{t("bankAccountHeader")}</span>
                  <p className="text-white font-bold text-xs">{t("kbankName")}</p>
                  <p className="text-tif-gold font-bold text-sm">012-3-45678-9</p>
                  <p className="text-slate-300 text-[10px]">{t("companyAccountName")}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200 block">{t("selectSlipFileLabel")} (Auto Compress to 5MB)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      let selected = e.target.files?.[0];
                      if (!selected) return;

                      if (selected.size > 5 * 1024 * 1024 && selected.type.startsWith("image/")) {
                        selected = await compressImageIfNeeded(selected, 5 * 1024 * 1024);
                      }

                      if (selected && selected.size > 5 * 1024 * 1024) {
                        alert("ขนาดไฟล์สลิปเกิน 5MB กรุณาเลือกไฟล์รูปภาพหรือ PDF ขนาดไม่เกิน 5MB");
                        e.target.value = "";
                        setSlipFile(null);
                        return;
                      }
                      setSlipFile(selected || null);
                    }}
                    className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-1.5 rounded-xl border border-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block">รองรับไฟล์ JPG, PNG, PDF (รูปภาพขนาดใหญ่จะถูกย่อให้อัตโนมัติไม่เกิน 5MB)</span>
                  {slipFile && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      {t("selectedFileLabel")} {slipFile.name} ({Math.round(slipFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full font-bold shadow-lg mt-2"
              onClick={handleConfirmSubmitSlip}
              disabled={uploadingSlip}
            >
              {uploadingSlip ? t("submittingSlipBtn") : t("confirmSubmitSlipBtn")}
            </Button>
          </div>
        )}
      </Modal>

      {/* ================================================================ */}
      {/* RE-UPLOAD DOCUMENT MODAL                                          */}
      {/* ================================================================ */}
      <Modal
        isOpen={reuploadModalOpen}
        onClose={() => setReuploadModalOpen(false)}
        title={`${t("reuploadModalTitle")} (${activePayAppNum})`}
        description={t("reuploadModalDesc")}
      >
        <div className="space-y-4 text-xs text-slate-200">
          {/* Document Type Selector */}
          <div>
            <label className="font-bold text-slate-200 block mb-1.5">{t("selectDocTypeLabel")}</label>
            <select
              value={reuploadType}
              onChange={(e) => setReuploadType(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-tif-gold focus:outline-none font-medium"
            >
              <option value="NATIONAL_ID">{t("docNationalId")}</option>
              <option value="PASSPORT">{t("docPassport")}</option>
              <option value="TRANSCRIPT">{t("docTranscript")}</option>
              <option value="TOEIC">{t("docToeic")}</option>
              <option value="MEDICAL_CERT">{t("docMedicalCert")}</option>
              <option value="HOUSE_REGISTRATION">{t("docHouseRegistration")}</option>
              <option value="PASSPORT_PHOTO">{t("docPassportPhoto")}</option>
              <option value="OTHER">{t("docOther")}</option>
            </select>
          </div>

          {activeReuploadDoc?.rejectReason && (
            <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800 space-y-1 text-rose-300">
              <span className="text-[10px] text-rose-400 font-bold uppercase block">{t("previousRejectReasonTitle")}</span>
              <p className="text-xs">{activeReuploadDoc.rejectReason}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block">{t("selectNewDocFileLabel")} (Auto Compress to 5MB)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={async (e) => {
                let selected = e.target.files?.[0];
                if (!selected) return;

                if (selected.size > 5 * 1024 * 1024 && selected.type.startsWith("image/")) {
                  selected = await compressImageIfNeeded(selected, 5 * 1024 * 1024);
                }

                if (selected && selected.size > 5 * 1024 * 1024) {
                  alert("ขนาดไฟล์เอกสารเกิน 5MB กรุณาเลือกไฟล์รูปภาพหรือ PDF ขนาดไม่เกิน 5MB");
                  e.target.value = "";
                  setReuploadFile(null);
                  return;
                }
                setReuploadFile(selected || null);
              }}
              className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800"
            />
            <span className="text-[10px] text-slate-400 block">รองรับไฟล์ JPG, PNG, PDF (รูปภาพขนาดใหญ่จะถูกย่อให้อัตโนมัติไม่เกิน 5MB)</span>
            {reuploadFile && (
              <p className="text-[11px] text-emerald-400 font-mono">
                {t("selectedFileLabel")} {reuploadFile.name} ({Math.round(reuploadFile.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReuploadModalOpen(false)}>
              {t("cancelBtn")}
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleConfirmReupload}
              disabled={uploadingReupload}
              className="font-bold"
            >
              {uploadingReupload ? t("uploadingDocBtn") : t("confirmUploadDocBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}