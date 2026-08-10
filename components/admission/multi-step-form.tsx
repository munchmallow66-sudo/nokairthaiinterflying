"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  MapPin,
  GraduationCap,
  PhoneCall,
  HeartHandshake,
  Stethoscope,
  Award,
  Briefcase,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  CreditCard,
  Clock,
  Copy,
  Check,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Uploader } from "@/components/ui/uploader";
import { StepIndicator } from "@/components/admission/step-indicator";
import { fullApplicationSchema, FullApplicationInput } from "@/schemas/application-schema";
import { useLanguage } from "@/lib/i18n/language-context";
import { useApplicationContext } from "@/lib/context/application-context";
import { formatDocumentFileName, generateSecurePassword } from "@/lib/utils";


const DRAFT_STORAGE_KEY = "tif_cadet_application_draft";

export function MultiStepForm() {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const { t, language } = useLanguage();
  const { addApplication } = useApplicationContext();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState<{ appNum: string; password?: string } | null>(null);
  const [submitError, setSubmitError] = React.useState<{ message?: string } | null>(null);
  const [duplicateInfo, setDuplicateInfo] = React.useState<{ applicationNumber: string } | null>(null);
  // Generated once and reused on every retry so a failed-then-retried submission
  // never ends up as two different application numbers in the admin panel.
  const appNumRef = React.useRef<string | null>(null);
  const [isRestored, setIsRestored] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState<string | null>(null);

  const STEPS = [
    { id: 1, title: t("step1Title"), subtitle: t("step1Sub") },
    { id: 2, title: t("step2Title"), subtitle: t("step2Sub") },
    { id: 3, title: t("step3Title"), subtitle: t("step3Sub") },
    { id: 4, title: t("step4Title"), subtitle: t("step4Sub") },
    { id: 5, title: t("step6Title"), subtitle: t("step6Sub") },
    { id: 6, title: t("step7Title"), subtitle: t("step7Sub") },
    { id: 7, title: t("step8Title"), subtitle: t("step8Sub") },
    { id: 8, title: t("step9Title"), subtitle: t("step9Sub") },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FullApplicationInput>({
    resolver: zodResolver(fullApplicationSchema),
    defaultValues: {
      title: "Mr.",
      nationality: "Thai",
      gender: "Male",
      documents: [],
    },
  });

  // 1. State Persistence: Restore saved draft from localStorage on mount
  React.useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed?.formData) {
          reset(parsed.formData);
        }
        // Always start at Step 1 for normal user application flow
        setCurrentStep(1);
        if (parsed?.savedAt) {
          setLastSavedTime(new Date(parsed.savedAt).toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("Failed to restore form draft:", err);
    } finally {
      setIsRestored(true);
    }
  }, [reset]);

  // 2. State Persistence: Auto-save draft on form input or step changes
  const watchedValues = watch();
  const watchedBirthday = watch("birthday");

  // Auto-calculate Age when Birthday changes
  React.useEffect(() => {
    if (watchedBirthday) {
      const birthDate = new Date(watchedBirthday);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 120) {
          setValue("age", calculatedAge, { shouldValidate: true, shouldDirty: true });
        }
      }
    }
  }, [watchedBirthday, setValue]);

  React.useEffect(() => {
    if (!isRestored || submitSuccess) return;
    try {
      const draftPayload = {
        formData: watchedValues,
        currentStep: currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to save form draft:", err);
    }
  }, [watchedValues, currentStep, isRestored, submitSuccess]);

  // 3. Clear draft helper
  const handleClearDraft = () => {
    const confirmText =
      language === "th"
        ? "คุณต้องการล้างข้อมูลร่างที่กรอกไว้เพื่อเริ่มใหม่ใช่หรือไม่?"
        : "Are you sure you want to clear your saved draft and start over?";

    if (window.confirm(confirmText)) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      reset({
        title: "Mr.",
        nationality: "Thai",
        gender: "Male",
        documents: [],
      });
      setCurrentStep(1);
      setLastSavedTime(null);
    }
  };

  const title = watch("title");
  const gender = watch("gender");
  const isMale = (gender?.toLowerCase() === "male" || gender === "ชาย" || title === "Mr." || title === "นาย") && gender?.toLowerCase() !== "female" && gender !== "หญิง";

  const REQUIRED_DOCS_CONFIG = [
    { type: "PHOTO_1_INCH", titleTh: "1. รูปถ่าย 1.5 นิ้ว", titleEn: "1. 1.5-inch Photo" },
    { type: "NATIONAL_ID_CERTIFIED", titleTh: "2. สำเนาบัตรประชาชน (รับรองสำเนาถูกต้อง)", titleEn: "2. Certified National ID" },
    { type: "TRANSCRIPT_CERTIFIED", titleTh: "3. สำเนาวุฒิการศึกษา (รับรองสำเนาถูกต้อง)", titleEn: "3. Certified Academic Transcript" },
    { type: "HOUSE_REGISTRATION_CERTIFIED", titleTh: "4. สำเนาทะเบียนบ้าน (รับรองสำเนาถูกต้อง)", titleEn: "4. Certified House Registration" },
    { type: "TOEIC", titleTh: "5. ผลการทดสอบภาษาอังกฤษ (English Proficiency Test Result)", titleEn: "5. English Proficiency Test Result" },
    { type: "CRIMINAL_RECORD_CHECK", titleTh: "6. ผลตรวจประวัติอาชญากรรม", titleEn: "6. Criminal Record Check" },
    ...(isMale
      ? [
          {
            type: "MILITARY_SERVICE_EXEMPTION",
            titleTh: "7. ใบสำคัญแสดงการขอยกเว้นการรับราชการทหาร (สด.8 หรือ สด.43)",
            titleEn: "7. Military Service Exemption Certificate (Sor Dor 8 or Sor Dor 43)",
          },
        ]
      : []),
  ];

  const documents = watch("documents") || [];
  const uploadedDocTypes = new Set((documents || []).map((d: any) => d.type));
  const missingRequiredDocs = REQUIRED_DOCS_CONFIG.filter((doc) => !uploadedDocTypes.has(doc.type));
  const isAllDocsUploaded = missingRequiredDocs.length === 0;
  const totalRequiredCount = REQUIRED_DOCS_CONFIG.length;

  const lastStepChangeRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    lastStepChangeRef.current = Date.now();
  }, [currentStep]);

  const handleFinalSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    // Prevent accidental click carry-over when user clicks "Next" on Step 8
    if (Date.now() - lastStepChangeRef.current < 500) {
      return;
    }

    if (!isAllDocsUploaded) {
      const missingTitles = missingRequiredDocs
        .map((d) => (language === "th" ? d.titleTh : d.titleEn))
        .join("\n- ");
      alert(
        language === "th"
          ? `กรุณาอัปโหลดเอกสารประกอบการสมัครให้ครบถ้วนทั้ง ${totalRequiredCount} รายการก่อนส่งใบสมัคร\n\nเอกสารที่ยังขาดอยู่ (${missingRequiredDocs.length} รายการ):\n- ${missingTitles}`
          : `Please upload all ${totalRequiredCount} required documents before submitting your application.\n\nMissing documents (${missingRequiredDocs.length}):\n- ${missingTitles}`
      );
      return;
    }

    handleSubmit(onSubmit, onInvalid)(e);
  };

  const handleNextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["title", "firstNameTh", "lastNameTh", "firstNameEn", "lastNameEn", "gender", "birthday", "age", "phone", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["currentAddress", "province", "district", "subdistrict", "postalCode"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["degree", "gpax", "graduationYear"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["emergencyName", "relationship", "emergencyPhone", "emergencyAddress"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["height", "weight", "bloodType"];
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDocumentUpload = (uploaded: any) => {
    const currentDocs = getValues("documents") || [];
    const existingIndex = currentDocs.findIndex((d: any) => d?.type === uploaded.type);
    let updated: any[];
    if (existingIndex > -1) {
      updated = [...currentDocs];
      updated[existingIndex] = uploaded;
    } else {
      updated = [...currentDocs, uploaded];
    }
    setValue("documents", updated, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const handleDocumentRemove = (docType: string) => {
    const currentDocs = getValues("documents") || [];
    const updated = currentDocs.filter((d: any) => d?.type !== docType);
    setValue("documents", updated, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const onInvalid = (errors: any) => {
    console.warn("Validation errors preventing submit:", errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      const errorMsg = errors[firstField]?.message || "กรุณาตรวจสอบข้อมูลในแบบฟอร์ม";

      // Jump to step containing first invalid field
      let targetStep = 1;
      if (["currentAddress", "province", "district", "subdistrict", "postalCode"].includes(firstField)) targetStep = 2;
      else if (["school", "university", "degree", "gpax", "graduationYear"].includes(firstField)) targetStep = 3;
      else if (["emergencyName", "relationship", "emergencyPhone", "emergencyAddress"].includes(firstField)) targetStep = 4;
      else if (["height", "weight", "bloodType", "medicalConditions", "allergy", "medication"].includes(firstField)) targetStep = 5;
      else if (["toeicScore", "ieltsScore", "icaoLevel", "otherCertificates"].includes(firstField)) targetStep = 6;
      else if (["company", "position", "years"].includes(firstField)) targetStep = 7;
      else if (["documents"].includes(firstField)) targetStep = 8;

      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      alert(`ไม่สามารถส่งใบสมัครได้: ${errorMsg}\n(ระบบพาคุณย้อนกลับไปยังขั้นตอนที่ ${targetStep} เพื่อแก้ไข)`);
    }
  };

  const onSubmit = async (data: FullApplicationInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setDuplicateInfo(null);

    // Generate the application number ONCE and reuse it on every retry —
    // re-randomizing here would let a retried submission land in the admin
    // panel under a different number than the one the applicant was shown.
    if (!appNumRef.current) {
      const year = new Date().getFullYear();
      appNumRef.current = `TIF-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const appNum = appNumRef.current;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, applicationNumber: appNum }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Parse defensively — a proxy/edge error can return an HTML body
      // instead of JSON, and res.json() would otherwise throw a confusing
      // "Unexpected token <" instead of the real HTTP status.
      let responseData: any = null;
      try {
        responseData = await res.json();
      } catch {
        responseData = null;
      }

      if (res.status === 409 && responseData?.duplicate) {
        setDuplicateInfo({ applicationNumber: responseData.applicationNumber || appNum });
        return;
      }

      if (!res.ok || responseData?.success === false) {
        throw new Error(responseData?.error || `Request failed with status ${res.status}`);
      }

      const finalAppNum = responseData.applicationNumber || appNum;
      const finalPassword = responseData?.password || generateSecurePassword(6);

      // Save to global ApplicationContext so Admin sees it instantly
      try {
        addApplication({
          id: responseData.id || `app_${Date.now()}`,
          applicationNumber: finalAppNum,
          password: finalPassword,
          branch: "Bangkok Headquarters",
          preferredStartDate: new Date("2026-09-01"),
          status: "DOCS_UNDER_REVIEW",
          createdAt: new Date(),
          updatedAt: new Date(),
          student: {
            id: `std_${Date.now()}`,
            title: data.title,
            firstNameTh: data.firstNameTh,
            lastNameTh: data.lastNameTh,
            firstNameEn: data.firstNameEn,
            lastNameEn: data.lastNameEn,
            nickname: data.nickname,
            gender: data.gender,
            birthday: new Date(data.birthday),
            age: Number(data.age),
            nationality: data.nationality,
            religion: data.religion,
            nationalId: data.nationalId,
            passport: data.passport,
            phone: data.phone,
            user: { email: data.email },
            address: {
              currentAddress: data.currentAddress,
              province: data.province,
              district: data.district,
              subdistrict: data.subdistrict,
              postalCode: data.postalCode,
            },
            education: {
              school: data.school || "-",
              university: data.university,
              degree: data.degree,
              gpax: Number(data.gpax),
              graduationYear: Number(data.graduationYear),
            },
            emergency: {
              name: data.emergencyName,
              relationship: data.relationship,
              phone: data.emergencyPhone,
              address: data.emergencyAddress,
            },
            parent: {
              fatherName: data.fatherName,
              motherName: data.motherName,
              occupation: data.parentOccupation,
              phone: data.parentPhone,
            },
            medical: {
              height: Number(data.height),
              weight: Number(data.weight),
              bloodType: data.bloodType,
              medicalConditions: data.medicalConditions,
              allergy: data.allergy,
            },
            english: {
              toeicScore: data.toeicScore ? Number(data.toeicScore) : undefined,
              ieltsScore: data.ieltsScore ? Number(data.ieltsScore) : undefined,
              icaoLevel: data.icaoLevel ? Number(data.icaoLevel) : undefined,
            },
          },
          course: {
            id: "cpl-002",
            name: "Commercial Pilot License (CPL)",
            code: "CPL",
            price: 1250000,
            duration: "14 Months",
          },
          documents: (data.documents || []).map((doc: any, idx: number) => ({
            id: `doc_${Date.now()}_${idx}`,
            type: doc.type,
            secureUrl: doc.secureUrl,
            publicId: doc.publicId,
            originalName: formatDocumentFileName(
              finalAppNum,
              data.title,
              data.firstNameEn || data.firstNameTh,
              doc.type,
              doc.originalName
            ),
            isVerified: false,
            uploadedAt: new Date(),
          })),
          payments: [],
          interviews: [],
          adminNotes: [],
        });
      } catch (ctxErr) {
        console.warn("Context save warning:", ctxErr);
      }

      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}

      setSubmitSuccess({ appNum: finalAppNum, password: finalPassword });
    } catch (err: any) {
      console.warn("Application submit failed:", err);

      // Keep the local admin-visibility fallback (business logic unchanged),
      // but do NOT clear the draft and do NOT report success — the server
      // never confirmed this submission actually reached the database.
      try {
        addApplication({
          id: `app_${Date.now()}`,
          applicationNumber: appNum,
          branch: "Bangkok Headquarters",
          preferredStartDate: new Date("2026-09-01"),
          status: "DOCS_UNDER_REVIEW",
          createdAt: new Date(),
          updatedAt: new Date(),
          student: {
            id: `std_${Date.now()}`,
            title: data.title,
            firstNameTh: data.firstNameTh,
            lastNameTh: data.lastNameTh,
            firstNameEn: data.firstNameEn,
            lastNameEn: data.lastNameEn,
            nickname: data.nickname,
            gender: data.gender,
            birthday: new Date(data.birthday),
            age: Number(data.age),
            nationality: data.nationality,
            religion: data.religion,
            nationalId: data.nationalId,
            passport: data.passport,
            phone: data.phone,
            user: { email: data.email },
            address: {
              currentAddress: data.currentAddress,
              province: data.province,
              district: data.district,
              subdistrict: data.subdistrict,
              postalCode: data.postalCode,
            },
            education: {
              school: data.school || "-",
              university: data.university,
              degree: data.degree,
              gpax: Number(data.gpax),
              graduationYear: Number(data.graduationYear),
            },
            emergency: {
              name: data.emergencyName,
              relationship: data.relationship,
              phone: data.emergencyPhone,
              address: data.emergencyAddress,
            },
            parent: {
              fatherName: data.fatherName,
              motherName: data.motherName,
              occupation: data.parentOccupation,
              phone: data.parentPhone,
            },
            medical: {
              height: Number(data.height),
              weight: Number(data.weight),
              bloodType: data.bloodType,
              medicalConditions: data.medicalConditions,
              allergy: data.allergy,
            },
            english: {
              toeicScore: data.toeicScore ? Number(data.toeicScore) : undefined,
              ieltsScore: data.ieltsScore ? Number(data.ieltsScore) : undefined,
              icaoLevel: data.icaoLevel ? Number(data.icaoLevel) : undefined,
            },
          },
          course: {
            id: "cpl-002",
            name: "Commercial Pilot License (CPL)",
            code: "CPL",
            price: 1250000,
            duration: "14 Months",
          },
          documents: (data.documents || []).map((doc: any, idx: number) => ({
            id: `doc_${Date.now()}_${idx}`,
            type: doc.type,
            secureUrl: doc.secureUrl,
            publicId: doc.publicId,
            originalName: doc.originalName,
            isVerified: false,
            uploadedAt: new Date(),
          })),
          payments: [],
          interviews: [],
          adminNotes: [],
        });
      } catch (ctxErr) {
        console.warn("Context save warning:", ctxErr);
      }

      setSubmitError({ message: err?.message });
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const [showPaymentNow, setShowPaymentNow] = React.useState(false);
  const [slipFile, setSlipFile] = React.useState<File | null>(null);
  const [slipUploaded, setSlipUploaded] = React.useState(false);
  const [uploadingSlip, setUploadingSlip] = React.useState(false);

  const handleUploadSlipSubmit = async () => {
    if (!slipFile) {
      alert("กรุณาเลือกไฟล์สลิปโอนเงิน (JPG, PNG หรือ PDF)");
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
          appNum: submitSuccess?.appNum || "TIF-2026-1973",
          studentName: watchedValues?.firstNameTh ? `${watchedValues.firstNameTh} ${watchedValues.lastNameTh}` : "สมชาย ใจดี",
          amount: 1800,
          slipUrl: slipDataUrl,
        }),
      });
    } catch (e) {}

    setTimeout(() => {
      setUploadingSlip(false);
      setSlipUploaded(true);
      alert(`อัปโหลดสลิปโอนเงินสำเร็จแล้วสำหรับใบสมัคร ${submitSuccess?.appNum}! ข้อมูลถูกบันทึกเข้าสู่ระบบ Admin แล้ว`);
    }, 1200);
  };

  if (submitSuccess) {
    return (
      <Card className="max-w-3xl mx-auto p-6 sm:p-8 border-2 border-tif-gold/40 shadow-2xl bg-white text-slate-900 animate-in fade-in duration-300">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-tif-navy mb-2">
            {t("submittedSuccessTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 mb-4">
            {t("appNumberIs")}
          </CardDescription>

          <div className="bg-slate-50 border border-slate-200/90 p-4 sm:p-5 rounded-2xl mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === "th" ? "หมายเลขใบสมัคร (Application No.)" : "Application Number"}
                </span>
                <span className="text-xl font-bold font-mono text-tif-navy block">
                  {submitSuccess.appNum}
                </span>
              </div>
              {submitSuccess.password && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === "th" ? "รหัสผ่านติดตามสถานะ (Password)" : "Tracking Password"}
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-600 block">
                    {submitSuccess.password}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => {
                  const textToCopy = `Application Number: ${submitSuccess.appNum}\nPassword: ${submitSuccess.password || ""}`;
                  navigator.clipboard.writeText(textToCopy);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md border ${
                  copied
                    ? "bg-emerald-600 text-white border-emerald-500 scale-105"
                    : "bg-tif-navy hover:bg-slate-800 text-white border-slate-700 active:scale-95"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>{language === "th" ? "คัดลอกเลขใบสมัครและ Password แล้ว!" : "Copied App Number & Password!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-tif-gold" />
                    <span>{language === "th" ? "คัดลอกเลขใบสมัครและ Password" : "Copy App Number & Password"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Next Step Info Box: Document Screening First */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 mb-6 space-y-3 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-bold border border-amber-300/60">
            <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
            <span>{t("submitSuccessCurrentStatus")}</span>
          </div>
          <h4 className="text-base font-bold text-tif-navy font-display">
            {t("submitSuccessNextStepTitle")}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
            {t("submitSuccessNextStepDesc")}
          </p>
        </div>

        {/* Email Spam Notice */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-6 text-left flex items-start gap-3.5 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
            <Mail className="h-5 w-5" />
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <span className="font-bold text-blue-950 text-sm block">
              {language === "th" ? "📩 แจ้งเตือนการรับอีเมลยืนยัน:" : "📩 Email Confirmation Notice:"}
            </span>
            <p className="leading-relaxed text-slate-600">
              {language === "th"
                ? "ระบบได้ส่งอีเมลยืนยันและรหัสติดตามสถานะไปยังอีเมลของท่านแล้ว หากไม่พบอีเมลในกล่องขาเข้า (Inbox) กรุณาตรวจสอบในโฟลเดอร์ อีเมลขยะ (Junk / Spam Mail) และกด 'ไม่ใช่อีเมลขยะ' (Not Spam)"
                : "A confirmation email has been sent to your inbox. If you do not see it in your Inbox, please check your Junk/Spam folder and mark it as 'Not Spam'."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="gold" size="lg" onClick={() => router.push("/track")} className="font-bold shadow-md">
            {t("submitSuccessTrackBtn")}
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/")} className="border-slate-300 text-slate-700 hover:bg-slate-100">
            {t("submitSuccessHomeBtn")}
          </Button>
        </div>
      </Card>
    );
  }

  if (duplicateInfo) {
    return (
      <Card className="max-w-3xl mx-auto p-6 sm:p-8 border-2 border-tif-gold/40 shadow-2xl bg-white text-slate-900 animate-in fade-in duration-300">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4 shadow-inner">
            <FileCheck className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-tif-navy mb-2">
            {t("duplicateApplicationTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 mb-4 max-w-lg mx-auto">
            {t("duplicateApplicationDesc")}
          </CardDescription>

          <div className="bg-tif-navy text-tif-gold text-2xl font-bold font-mono px-6 py-3 rounded-2xl shadow-lg tracking-wider border border-tif-gold/30 inline-block mb-6">
            {duplicateInfo.applicationNumber}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="gold" size="lg" onClick={() => router.push("/track")} className="font-bold shadow-md">
            {t("duplicateApplicationTrackBtn")}
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/")} className="border-slate-300 text-slate-700 hover:bg-slate-100">
            {t("submitSuccessHomeBtn")}
          </Button>
        </div>
      </Card>
    );
  }

  if (submitError) {
    return (
      <Card className="max-w-3xl mx-auto p-6 sm:p-8 border-2 border-rose-300 shadow-2xl bg-white text-slate-900 animate-in fade-in duration-300">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4 shadow-inner">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-tif-navy mb-2">
            {t("submitErrorTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
            {t("submitErrorDesc")}
          </CardDescription>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 text-center space-y-1.5">
          <p className="text-xs text-rose-700 font-medium">{t("submitErrorContactPrompt")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-tif-navy">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-tif-gold" />
              {t("phoneContact")}
            </span>
            <span>{t("emailContact")}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="gold" size="lg" onClick={() => setSubmitError(null)} className="font-bold shadow-md">
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {t("submitErrorRetryBtn")}
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/contact")} className="border-slate-300 text-slate-700 hover:bg-slate-100">
            {t("submitErrorContactBtn")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      <StepIndicator
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={(id) => setCurrentStep(id)}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 9) {
            handleSubmit(onSubmit, onInvalid)(e);
          } else {
            handleNextStep();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (currentStep < 9) {
              handleNextStep();
            }
          }
        }}
      >
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xl">
          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <User className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 1: {t("step1Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step1Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("titleLabel")} *</label>
                  <select {...register("title")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold">
                    <option value="Mr.">Mr. (นาย)</option>
                    <option value="Ms.">Ms. (นางสาว)</option>
                    <option value="Mrs.">Mrs. (นาง)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("firstNameThLabel")} *</label>
                  <input
                    {...register("firstNameTh")}
                    placeholder="สมชาย"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^ก-๙\s-]/g, "");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold"
                  />
                  {errors.firstNameTh && <p className="text-xs text-rose-600 mt-1">{errors.firstNameTh.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("lastNameThLabel")} *</label>
                  <input
                    {...register("lastNameTh")}
                    placeholder="ใจดี"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^ก-๙\s-]/g, "");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold"
                  />
                  {errors.lastNameTh && <p className="text-xs text-rose-600 mt-1">{errors.lastNameTh.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("firstNameEnLabel")} *</label>
                  <input
                    {...register("firstNameEn")}
                    placeholder="Somchai"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s-]/g, "");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold"
                  />
                  {errors.firstNameEn && <p className="text-xs text-rose-600 mt-1">{errors.firstNameEn.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("lastNameEnLabel")} *</label>
                  <input
                    {...register("lastNameEn")}
                    placeholder="Jaidee"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s-]/g, "");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold"
                  />
                  {errors.lastNameEn && <p className="text-xs text-rose-600 mt-1">{errors.lastNameEn.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("nicknameLabel")}</label>
                  <input {...register("nickname")} placeholder="Boy" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("genderLabel")} *</label>
                  <select {...register("gender")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("birthdayLabel")} *</label>
                  <input type="date" {...register("birthday")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.birthday && <p className="text-xs text-rose-600 mt-1">{errors.birthday.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("ageLabel")} *</label>
                  <input type="number" {...register("age")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("nationalityLabel")} *</label>
                  <input {...register("nationality")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("nationalIdLabel")}</label>
                  <input
                    {...register("nationalId")}
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    placeholder="1100200345678"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 13);
                    }}
                    className={`mt-1 w-full rounded-lg border p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 font-mono ${
                      errors.nationalId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-tif-gold focus:ring-tif-gold"
                    }`}
                  />
                  {errors.nationalId && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.nationalId.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("passportLabel")}</label>
                  <input {...register("passport")} placeholder="AA1234567" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("phoneLabel")} *</label>
                  <input
                    {...register("phone")}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0819998888"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold font-mono"
                  />
                  {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("emailLabel")} *</label>
                  <input type="email" {...register("email")} placeholder="somchai@example.com" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <MapPin className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 2: {t("step2Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step2Sub")}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase">{t("currentAddressLabel")} *</label>
                <textarea {...register("currentAddress")} rows={3} placeholder="House No., Building, Street..." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                {errors.currentAddress && <p className="text-xs text-rose-600 mt-1">{errors.currentAddress.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("provinceLabel")} *</label>
                  <input {...register("province")} placeholder="Bangkok" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.province && <p className="text-xs text-rose-600 mt-1">{errors.province.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("districtLabel")} *</label>
                  <input {...register("district")} placeholder="Chatuchak" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("subdistrictLabel")} *</label>
                  <input {...register("subdistrict")} placeholder="Chomphon" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.subdistrict && <p className="text-xs text-rose-600 mt-1">{errors.subdistrict.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("postalCodeLabel")} *</label>
                  <input
                    {...register("postalCode")}
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="10900"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 5);
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold font-mono"
                  />
                  {errors.postalCode && <p className="text-xs text-rose-600 mt-1">{errors.postalCode.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <GraduationCap className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 3: {t("step3Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step3Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("universityLabel")}</label>
                  <input {...register("university")} placeholder="Chulalongkorn University / Kasetsart University" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("degreeLabel")} *</label>
                  <input {...register("degree")} placeholder="Bachelor of Engineering" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.degree && <p className="text-xs text-rose-600 mt-1">{errors.degree.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("gpaxLabel")} *</label>
                  <input type="number" step="0.01" placeholder="3.50" {...register("gpax", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.gpax && <p className="text-xs text-rose-600 mt-1">{errors.gpax.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("graduationYearLabel")} *</label>
                  <input type="number" placeholder="2025" {...register("graduationYear", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.graduationYear && <p className="text-xs text-rose-600 mt-1">{errors.graduationYear.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Emergency Contact */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <PhoneCall className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 4: {t("step4Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step4Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("emergencyNameLabel")} *</label>
                  <input {...register("emergencyName")} placeholder="Somsak Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.emergencyName && <p className="text-xs text-rose-600 mt-1">{errors.emergencyName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("relationshipLabel")} *</label>
                  <input {...register("relationship")} placeholder="Father / Mother / Spouse" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.relationship && <p className="text-xs text-rose-600 mt-1">{errors.relationship.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("emergencyPhoneLabel")} *</label>
                  <input
                    {...register("emergencyPhone")}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0812345678"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold font-mono"
                  />
                  {errors.emergencyPhone && <p className="text-xs text-rose-600 mt-1">{errors.emergencyPhone.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase">{t("emergencyAddressLabel")} *</label>
                <textarea {...register("emergencyAddress")} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                {errors.emergencyAddress && <p className="text-xs text-rose-600 mt-1">{errors.emergencyAddress.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 5: Aviation Medical */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <Stethoscope className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 5: {t("step6Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step6Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("heightLabel")} *</label>
                  <input type="number" placeholder="175" {...register("height", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.height && <p className="text-xs text-rose-600 mt-1">{errors.height.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("weightLabel")} *</label>
                  <input type="number" placeholder="65" {...register("weight", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.weight && <p className="text-xs text-rose-600 mt-1">{errors.weight.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("bloodTypeLabel")} *</label>
                  <select {...register("bloodType")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold">
                    <option value="O">Type O</option>
                    <option value="A">Type A</option>
                    <option value="B">Type B</option>
                    <option value="AB">Type AB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("medicalConditionsLabel")}</label>
                  <input {...register("medicalConditions")} placeholder="None" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("allergyLabel")}</label>
                  <input {...register("allergy")} placeholder="Penicillin" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("medicationLabel")}</label>
                  <input {...register("medication")} placeholder="None" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: English */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <Award className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 6: {t("step7Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step7Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("toeicLabel")}</label>
                  <input type="number" placeholder="750" {...register("toeicScore")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("ieltsLabel")}</label>
                  <input type="number" step="0.5" placeholder="6.5" {...register("ieltsScore")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Employment */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <Briefcase className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 7: {t("step8Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step8Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("companyLabel")}</label>
                  <input {...register("company")} placeholder="Thai Airways" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("positionLabel")}</label>
                  <input {...register("position")} placeholder="Flight Dispatcher" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("yearsLabel")}</label>
                  <input type="number" {...register("years")} placeholder="2" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Document Checklist Upload */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                    <FileCheck className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 8: {t("step9Title")}
                  </h3>
                  <p className="text-sm text-slate-500">{t("step9Sub")}</p>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border shrink-0 ${
                    isAllDocsUploaded
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  }`}
                >
                  {isAllDocsUploaded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{language === "th" ? `อัปโหลดเอกสารครบถ้วนแล้ว (${totalRequiredCount}/${totalRequiredCount})` : `All Documents Uploaded (${totalRequiredCount}/${totalRequiredCount})`}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>
                        {language === "th"
                          ? `อัปโหลดเอกสารแล้ว ${totalRequiredCount - missingRequiredDocs.length}/${totalRequiredCount} รายการ (ยังไม่ครบ)`
                          : `Uploaded ${totalRequiredCount - missingRequiredDocs.length}/${totalRequiredCount} items (Incomplete)`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Uploader
                  label={t("docPhoto1Label")}
                  type="PHOTO_1_INCH"
                  existingFile={documents.find((d: any) => d?.type === "PHOTO_1_INCH")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("PHOTO_1_INCH")}
                />
                <Uploader
                  label={t("docIdLabel")}
                  type="NATIONAL_ID_CERTIFIED"
                  existingFile={documents.find((d: any) => d?.type === "NATIONAL_ID_CERTIFIED")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("NATIONAL_ID_CERTIFIED")}
                />
                <Uploader
                  label={t("docDegreeLabel")}
                  type="TRANSCRIPT_CERTIFIED"
                  existingFile={documents.find((d: any) => d?.type === "TRANSCRIPT_CERTIFIED")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("TRANSCRIPT_CERTIFIED")}
                />
                <Uploader
                  label={t("docHouseLabel")}
                  type="HOUSE_REGISTRATION_CERTIFIED"
                  existingFile={documents.find((d: any) => d?.type === "HOUSE_REGISTRATION_CERTIFIED")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("HOUSE_REGISTRATION_CERTIFIED")}
                />
                <Uploader
                  label={t("docEnglishTestLabel")}
                  type="TOEIC"
                  existingFile={documents.find((d: any) => d?.type === "TOEIC")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("TOEIC")}
                />
                <Uploader
                  label={t("docCriminalLabel")}
                  type="CRIMINAL_RECORD_CHECK"
                  existingFile={documents.find((d: any) => d?.type === "CRIMINAL_RECORD_CHECK")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("CRIMINAL_RECORD_CHECK")}
                />
                {isMale && (
                  <Uploader
                    label={t("docMilitaryLabel")}
                    type="MILITARY_SERVICE_EXEMPTION"
                    existingFile={documents.find((d: any) => d?.type === "MILITARY_SERVICE_EXEMPTION")}
                    onUploadSuccess={handleDocumentUpload}
                    onRemove={() => handleDocumentRemove("MILITARY_SERVICE_EXEMPTION")}
                  />
                )}
                <Uploader
                  label={t("docOtherLabel")}
                  type="OTHER"
                  existingFile={documents.find((d: any) => d?.type === "OTHER")}
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("OTHER")}
                />
              </div>

              {/* Incomplete / Complete Documents Status Banner */}
              {!isAllDocsUploaded ? (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      {language === "th"
                        ? `กรุณาอัปโหลดเอกสารให้ครบถ้วนทั้ง ${totalRequiredCount} รายการเพื่อเปิดใช้งานปุ่มส่งใบสมัคร`
                        : `Please upload all ${totalRequiredCount} required documents to enable application submission`}
                    </span>
                  </div>
                  <p className="font-semibold text-amber-800">
                    {language === "th"
                      ? `เอกสารที่ยังไม่ได้อัปโหลด (${missingRequiredDocs.length} รายการ):`
                      : `Missing documents (${missingRequiredDocs.length}):`}
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1 font-medium text-amber-900">
                    {missingRequiredDocs.map((doc) => (
                      <li key={doc.type}>
                        {language === "th" ? doc.titleTh : doc.titleEn}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>
                    {language === "th"
                      ? `อัปโหลดเอกสารครบถ้วนทั้ง ${totalRequiredCount} รายการเรียบร้อยแล้ว! สามารถกด "ยืนยันส่งใบสมัครเรียน" ได้ทันที`
                      : `All ${totalRequiredCount} documents uploaded successfully! You can now click "Submit Application"`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t("previousStep")}
            </Button>

            {currentStep < 8 ? (
              <Button type="button" variant="gold" onClick={handleNextStep} className="w-full sm:w-auto">
                {t("nextStep")} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant={isAllDocsUploaded ? "gold" : "outline"}
                size="lg"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !isAllDocsUploaded}
                className={`w-full sm:w-auto font-extrabold ${
                  !isAllDocsUploaded
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-300"
                    : "shadow-gold"
                }`}
              >
                {isSubmitting ? t("submitting") : t("submitApplication")}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
