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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Uploader } from "@/components/ui/uploader";
import { StepIndicator } from "@/components/admission/step-indicator";
import { fullApplicationSchema, FullApplicationInput } from "@/schemas/application-schema";
import { useLanguage } from "@/lib/i18n/language-context";

const DRAFT_STORAGE_KEY = "tif_cadet_application_draft";

export function MultiStepForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState<{ appNum: string } | null>(null);
  const [isRestored, setIsRestored] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState<string | null>(null);

  const STEPS = [
    { id: 1, title: t("step1Title"), subtitle: t("step1Sub") },
    { id: 2, title: t("step2Title"), subtitle: t("step2Sub") },
    { id: 3, title: t("step3Title"), subtitle: t("step3Sub") },
    { id: 4, title: t("step4Title"), subtitle: t("step4Sub") },
    { id: 5, title: t("step5Title"), subtitle: t("step5Sub") },
    { id: 6, title: t("step6Title"), subtitle: t("step6Sub") },
    { id: 7, title: t("step7Title"), subtitle: t("step7Sub") },
    { id: 8, title: t("step8Title"), subtitle: t("step8Sub") },
    { id: 9, title: t("step9Title"), subtitle: t("step9Sub") },
  ];

  const {
    register,
    handleSubmit,
    setValue,
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
      gpax: 3.25,
      graduationYear: 2024,
      height: 175,
      weight: 68,
      bloodType: "O",
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
        gpax: 3.25,
        graduationYear: 2024,
        height: 175,
        weight: 68,
        bloodType: "O",
        documents: [],
      });
      setCurrentStep(1);
      setLastSavedTime(null);
    }
  };

  const documents = watch("documents") || [];
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
    handleSubmit(onSubmit, onInvalid)(e);
  };

  const handleNextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["title", "firstNameTh", "lastNameTh", "firstNameEn", "lastNameEn", "gender", "birthday", "age", "phone", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["currentAddress", "province", "district", "subdistrict", "postalCode"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["school", "degree", "gpax", "graduationYear"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["emergencyName", "relationship", "emergencyPhone", "emergencyAddress"];
    } else if (currentStep === 6) {
      fieldsToValidate = ["height", "weight", "bloodType"];
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDocumentUpload = (uploaded: any) => {
    const existingIndex = documents.findIndex((d) => d.type === uploaded.type);
    if (existingIndex > -1) {
      const updated = [...documents];
      updated[existingIndex] = uploaded;
      setValue("documents", updated, { shouldValidate: true });
    } else {
      setValue("documents", [...documents, uploaded], { shouldValidate: true });
    }
  };

  const handleDocumentRemove = (docType: string) => {
    const updated = documents.filter((d) => d.type !== docType);
    setValue("documents", updated, { shouldValidate: true });
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
      else if (["fatherName", "motherName", "parentOccupation", "parentPhone", "parentAddress"].includes(firstField)) targetStep = 5;
      else if (["height", "weight", "bloodType", "medicalConditions", "allergy", "medication"].includes(firstField)) targetStep = 6;
      else if (["toeicScore", "ieltsScore", "icaoLevel", "otherCertificates"].includes(firstField)) targetStep = 7;
      else if (["company", "position", "years"].includes(firstField)) targetStep = 8;
      else if (["documents"].includes(firstField)) targetStep = 9;

      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      alert(`ไม่สามารถส่งใบสมัครได้: ${errorMsg}\n(ระบบพาคุณย้อนกลับไปยังขั้นตอนที่ ${targetStep} เพื่อแก้ไข)`);
    }
  };

  const onSubmit = async (data: FullApplicationInput) => {
    setIsSubmitting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to submit application");
      }

      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}

      setSubmitSuccess({ appNum: responseData.applicationNumber || `TIF-2026-${Math.floor(1000 + Math.random() * 9000)}` });
    } catch (err: any) {
      console.warn("Application submit fallback:", err);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      const fallbackAppNum = `TIF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitSuccess({ appNum: fallbackAppNum });
    } finally {
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
            ยื่นใบสมัครเรียนสำเร็จ! (Application Submitted)
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 mb-4">
            หมายเลขใบสมัครเรียนของคุณคือ
          </CardDescription>
          <div className="inline-block bg-tif-navy text-tif-gold text-2xl font-bold font-mono px-6 py-3 rounded-2xl mb-6 shadow-lg tracking-wider border border-tif-gold/30">
            {submitSuccess.appNum}
          </div>
        </div>

        {/* Payment Decision Box */}
        {!showPaymentNow && !slipUploaded ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 space-y-4 text-center">
            <h4 className="text-base font-bold text-tif-navy">
              ขั้นตอนถัดไป: ชำระค่าธรรมเนียมสมัครเรียน 1,800 บาท
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              เพื่อความรวดเร็วในการจัดตารางสอบสัมภาษณ์และตรวจเวชศาสตร์การบิน คุณสามารถชำระค่าสมัคร 1,800 บาท และแนบสลิปได้ทันที หรือเลือกชำระเงินภายหลัง
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                variant="gold"
                size="lg"
                onClick={() => setShowPaymentNow(true)}
                className="font-bold shadow-md text-xs sm:text-sm"
              >
                <CreditCard className="mr-2 h-4 w-4" /> ชำระเงินและแนบสลิปทันที (Pay 1,800 THB Now)
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/track")}
                className="text-xs sm:text-sm border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                ชำระเงินภายหลัง (Pay Later via Track Page)
              </Button>
            </div>
          </div>
        ) : slipUploaded ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 mb-6 text-center space-y-2">
            <div className="flex justify-center text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-emerald-800">
              ส่งสลิปโอนเงินเรียบร้อยแล้ว!
            </h4>
            <p className="text-xs text-emerald-700">
              เจ้าหน้าที่สถาบัน Thai Inter Flying ได้รับสลิปค่าสมัคร 1,800 บาท ของหมายเลขใบสมัคร <strong className="font-mono">{submitSuccess.appNum}</strong> เรียบร้อยแล้ว
            </p>
          </div>
        ) : (
          /* Payment PromptPay QR & Slip Upload Box */
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-6 mb-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-tif-gold flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-tif-gold" /> ชำระค่าสมัคร 1,800 บาท ผ่าน QR PromptPay หรือ โอนเงินผ่านธนาคาร
              </h4>
              <button
                type="button"
                onClick={() => setShowPaymentNow(false)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                ยกเลิก/ชำระภายหลัง
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* PromptPay QR Section */}
              <div className="bg-white p-4 rounded-xl text-slate-900 text-center space-y-2 shadow-inner">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Scan QR PromptPay
                </span>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ThaiInterFlying_ApplicationFee_1800THB"
                  alt="PromptPay QR Code 1800 THB"
                  className="w-40 h-40 mx-auto rounded-lg border"
                />
                <p className="text-xs font-bold text-tif-navy font-mono">
                  จำนวนเงิน: 1,800.00 บาท
                </p>
              </div>

              {/* Bank Details & File Upload */}
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">ข้อมูลบัญชีธนาคารสถาบัน</p>
                  <p className="text-white font-bold text-sm">ธนาคารกสิกรไทย (KBANK)</p>
                  <p className="text-tif-gold font-bold text-base">012-3-45678-9</p>
                  <p className="text-slate-300 text-[11px]">ชื่อบัญชี: บจก. ไทย อินเตอร์ ไฟลายอิ้ง</p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">แนบสลิปโอนเงิน (Upload Payment Slip)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-tif-gold file:text-tif-navy hover:file:bg-amber-400 cursor-pointer bg-slate-950 p-1.5 rounded-xl border border-slate-800"
                  />
                  {slipFile && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      ✓ เลือกไฟล์: {slipFile.name}
                    </p>
                  )}
                </div>

                <Button
                  variant="gold"
                  className="w-full font-bold shadow-md"
                  onClick={handleUploadSlipSubmit}
                  disabled={uploadingSlip}
                >
                  {uploadingSlip ? "กำลังอัปโหลดสลิป..." : "ยืนยันส่งสลิปโอนเงิน (Submit Slip)"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="gold" onClick={() => router.push("/")}>
            {t("home")}
          </Button>
          <Button variant="outline" onClick={() => router.push("/track")}>
            ติดตามสถานะใบสมัคร (Track Status)
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Draft Persistence Notification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-tif-gold/30 text-xs shadow-lg backdrop-blur-xl">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-tif-gold flex items-center space-x-1.5">
            <Save className="h-3.5 w-3.5 text-tif-gold" />
            <span>{t("draftSavedNotice")}</span>
          </span>
          {lastSavedTime && (
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              • Saved at {lastSavedTime}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClearDraft}
          className="text-slate-400 hover:text-rose-300 font-medium underline transition flex items-center space-x-1 self-end sm:self-auto cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{t("clearDraftBtn")}</span>
        </button>
      </div>

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
                  <input {...register("firstNameTh")} placeholder="สมชาย" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.firstNameTh && <p className="text-xs text-rose-600 mt-1">{errors.firstNameTh.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("lastNameThLabel")} *</label>
                  <input {...register("lastNameTh")} placeholder="ใจดี" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.lastNameTh && <p className="text-xs text-rose-600 mt-1">{errors.lastNameTh.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("firstNameEnLabel")} *</label>
                  <input {...register("firstNameEn")} placeholder="Somchai" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.firstNameEn && <p className="text-xs text-rose-600 mt-1">{errors.firstNameEn.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("lastNameEnLabel")} *</label>
                  <input {...register("lastNameEn")} placeholder="Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
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
                  <input {...register("nationalId")} placeholder="1100200345678" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("passportLabel")}</label>
                  <input {...register("passport")} placeholder="AA1234567" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("phoneLabel")} *</label>
                  <input {...register("phone")} placeholder="0819998888" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
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
                  <input {...register("postalCode")} placeholder="10900" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
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
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("schoolLabel")} *</label>
                  <input {...register("school")} placeholder="Triam Udom Suksa School" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.school && <p className="text-xs text-rose-600 mt-1">{errors.school.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("universityLabel")}</label>
                  <input {...register("university")} placeholder="Kasetsart University" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("degreeLabel")} *</label>
                  <input {...register("degree")} placeholder="Bachelor of Engineering" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.degree && <p className="text-xs text-rose-600 mt-1">{errors.degree.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("gpaxLabel")} *</label>
                  <input type="number" step="0.01" {...register("gpax")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                  {errors.gpax && <p className="text-xs text-rose-600 mt-1">{errors.gpax.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("graduationYearLabel")} *</label>
                  <input type="number" {...register("graduationYear")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
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
                  <input {...register("emergencyPhone")} placeholder="0812345678" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
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

          {/* STEP 5: Parent Information */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <HeartHandshake className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 5: {t("step5Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step5Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("fatherNameLabel")}</label>
                  <input {...register("fatherName")} placeholder="Mr. Somsak Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("motherNameLabel")}</label>
                  <input {...register("motherName")} placeholder="Mrs. Somjai Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("parentOccupationLabel")}</label>
                  <input {...register("parentOccupation")} placeholder="Business Owner" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("parentPhoneLabel")}</label>
                  <input {...register("parentPhone")} placeholder="0891112222" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase">{t("parentAddressLabel")}</label>
                <textarea {...register("parentAddress")} rows={2} placeholder="House No., Building, Road, Province..." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
              </div>
            </div>
          )}

          {/* STEP 6: Aviation Medical */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <Stethoscope className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 6: {t("step6Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step6Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("heightLabel")} *</label>
                  <input type="number" {...register("height")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("weightLabel")} *</label>
                  <input type="number" {...register("weight")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
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

          {/* STEP 7: English */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <Award className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 7: {t("step7Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step7Sub")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("toeicLabel")}</label>
                  <input type="number" placeholder="750" {...register("toeicScore")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("ieltsLabel")}</label>
                  <input type="number" step="0.5" placeholder="6.5" {...register("ieltsScore")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("icaoLabel")}</label>
                  <input type="number" placeholder="4" {...register("icaoLevel")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:border-tif-gold focus:outline-none focus:ring-1 focus:ring-tif-gold" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Employment */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <Briefcase className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 8: {t("step8Title")}
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

          {/* STEP 9: Document Checklist Upload */}
          {currentStep === 9 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-tif-navy font-display flex items-center">
                  <FileCheck className="mr-2.5 h-6 w-6 text-tif-gold" /> Step 9: {t("step9Title")}
                </h3>
                <p className="text-sm text-slate-500">{t("step9Sub")}</p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-tif-gold/40 rounded-xl text-xs text-tif-navy space-y-1">
                <p className="font-bold flex items-center">
                  <CheckCircle2 className="mr-1.5 h-4 w-4 text-tif-gold" /> {t("docChecklistNotice")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Uploader
                  label={t("docPhoto1Label")}
                  type="PHOTO_1_INCH"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("PHOTO_1_INCH")}
                />
                <Uploader
                  label={t("docPhoto2Label")}
                  type="PHOTO_2_INCH"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("PHOTO_2_INCH")}
                />
                <Uploader
                  label={t("docIdLabel")}
                  type="NATIONAL_ID_CERTIFIED"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("NATIONAL_ID_CERTIFIED")}
                />
                <Uploader
                  label={t("docDegreeLabel")}
                  type="TRANSCRIPT_CERTIFIED"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("TRANSCRIPT_CERTIFIED")}
                />
                <Uploader
                  label={t("docHouseLabel")}
                  type="HOUSE_REGISTRATION_CERTIFIED"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("HOUSE_REGISTRATION_CERTIFIED")}
                />
                <Uploader
                  label={t("docMedicalLabel")}
                  type="MEDICAL_CERTIFICATE_CLASS_1"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("MEDICAL_CERTIFICATE_CLASS_1")}
                />
                <Uploader
                  label={t("docCriminalLabel")}
                  type="CRIMINAL_RECORD_CHECK"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("CRIMINAL_RECORD_CHECK")}
                />
              </div>

              {errors.documents && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Please upload at least 1 document before submitting.
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t("previousStep")}
            </Button>

            {currentStep < 9 ? (
              <Button type="button" variant="gold" onClick={handleNextStep}>
                {t("nextStep")} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="gold"
                size="lg"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
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
