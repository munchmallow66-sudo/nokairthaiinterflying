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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Uploader } from "@/components/ui/uploader";
import { StepIndicator } from "@/components/admission/step-indicator";
import { fullApplicationSchema, FullApplicationInput } from "@/schemas/application-schema";
import { useLanguage } from "@/lib/i18n/language-context";

export function MultiStepForm() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState<{ appNum: string } | null>(null);

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

  const documents = watch("documents") || [];

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

  const onSubmit = async (data: FullApplicationInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to submit application");
      }

      setSubmitSuccess({ appNum: responseData.applicationNumber });
    } catch (err: any) {
      alert(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8 border-2 border-tif-gold/40 shadow-2xl bg-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <CardTitle className="text-3xl text-tif-navy mb-2">
          {t("submittedSuccessTitle")}
        </CardTitle>
        <CardDescription className="text-base text-slate-600 mb-6">
          {t("appNumberIs")}
        </CardDescription>
        <div className="inline-block bg-tif-navy text-tif-gold text-2xl font-bold font-mono px-6 py-3 rounded-xl mb-6 shadow-md tracking-wider">
          {submitSuccess.appNum}
        </div>
        <p className="text-sm text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
          {t("successMsg")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="gold" onClick={() => router.push("/")}>
            {t("home")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={(id) => setCurrentStep(id)}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
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
                  <select {...register("title")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm">
                    <option value="Mr.">Mr. (นาย)</option>
                    <option value="Ms.">Ms. (นางสาว)</option>
                    <option value="Mrs.">Mrs. (นาง)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("firstNameThLabel")} *</label>
                  <input {...register("firstNameTh")} placeholder="สมชาย" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.firstNameTh && <p className="text-xs text-rose-600 mt-1">{errors.firstNameTh.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("lastNameThLabel")} *</label>
                  <input {...register("lastNameTh")} placeholder="ใจดี" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.lastNameTh && <p className="text-xs text-rose-600 mt-1">{errors.lastNameTh.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("firstNameEnLabel")} *</label>
                  <input {...register("firstNameEn")} placeholder="Somchai" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.firstNameEn && <p className="text-xs text-rose-600 mt-1">{errors.firstNameEn.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("lastNameEnLabel")} *</label>
                  <input {...register("lastNameEn")} placeholder="Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.lastNameEn && <p className="text-xs text-rose-600 mt-1">{errors.lastNameEn.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("nicknameLabel")}</label>
                  <input {...register("nickname")} placeholder="Boy" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("genderLabel")} *</label>
                  <select {...register("gender")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("birthdayLabel")} *</label>
                  <input type="date" {...register("birthday")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.birthday && <p className="text-xs text-rose-600 mt-1">{errors.birthday.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("ageLabel")} *</label>
                  <input type="number" {...register("age")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("nationalityLabel")} *</label>
                  <input {...register("nationality")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("nationalIdLabel")}</label>
                  <input {...register("nationalId")} placeholder="1100200345678" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("passportLabel")}</label>
                  <input {...register("passport")} placeholder="AA1234567" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("phoneLabel")} *</label>
                  <input {...register("phone")} placeholder="0819998888" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("emailLabel")} *</label>
                  <input type="email" {...register("email")} placeholder="somchai@example.com" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                <textarea {...register("currentAddress")} rows={3} placeholder="House No., Building, Street..." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                {errors.currentAddress && <p className="text-xs text-rose-600 mt-1">{errors.currentAddress.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("provinceLabel")} *</label>
                  <input {...register("province")} placeholder="Bangkok" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.province && <p className="text-xs text-rose-600 mt-1">{errors.province.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("districtLabel")} *</label>
                  <input {...register("district")} placeholder="Chatuchak" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("subdistrictLabel")} *</label>
                  <input {...register("subdistrict")} placeholder="Chomphon" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.subdistrict && <p className="text-xs text-rose-600 mt-1">{errors.subdistrict.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("postalCodeLabel")} *</label>
                  <input {...register("postalCode")} placeholder="10900" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  <input {...register("school")} placeholder="Triam Udom Suksa School" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.school && <p className="text-xs text-rose-600 mt-1">{errors.school.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("universityLabel")}</label>
                  <input {...register("university")} placeholder="Kasetsart University" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("degreeLabel")} *</label>
                  <input {...register("degree")} placeholder="Bachelor of Engineering" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.degree && <p className="text-xs text-rose-600 mt-1">{errors.degree.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("gpaxLabel")} *</label>
                  <input type="number" step="0.01" {...register("gpax")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.gpax && <p className="text-xs text-rose-600 mt-1">{errors.gpax.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("graduationYearLabel")} *</label>
                  <input type="number" {...register("graduationYear")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  <input {...register("emergencyName")} placeholder="Somsak Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.emergencyName && <p className="text-xs text-rose-600 mt-1">{errors.emergencyName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("relationshipLabel")} *</label>
                  <input {...register("relationship")} placeholder="Father / Mother / Spouse" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.relationship && <p className="text-xs text-rose-600 mt-1">{errors.relationship.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("emergencyPhoneLabel")} *</label>
                  <input {...register("emergencyPhone")} placeholder="0812345678" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                  {errors.emergencyPhone && <p className="text-xs text-rose-600 mt-1">{errors.emergencyPhone.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase">{t("emergencyAddressLabel")} *</label>
                <textarea {...register("emergencyAddress")} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  <input {...register("fatherName")} placeholder="Mr. Somsak Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("motherNameLabel")}</label>
                  <input {...register("motherName")} placeholder="Mrs. Somjai Jaidee" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("parentOccupationLabel")}</label>
                  <input {...register("parentOccupation")} placeholder="Business Owner" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("parentPhoneLabel")}</label>
                  <input {...register("parentPhone")} placeholder="0891112222" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase">{t("parentAddressLabel")}</label>
                <textarea {...register("parentAddress")} rows={2} placeholder="House No., Building, Road, Province..." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  <input type="number" {...register("height")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("weightLabel")} *</label>
                  <input type="number" {...register("weight")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("bloodTypeLabel")} *</label>
                  <select {...register("bloodType")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm">
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
                  <input {...register("medicalConditions")} placeholder="None" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("allergyLabel")}</label>
                  <input {...register("allergy")} placeholder="Penicillin" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("medicationLabel")}</label>
                  <input {...register("medication")} placeholder="None" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  <input type="number" placeholder="750" {...register("toeicScore")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("ieltsLabel")}</label>
                  <input type="number" step="0.5" placeholder="6.5" {...register("ieltsScore")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("icaoLabel")}</label>
                  <input type="number" placeholder="4" {...register("icaoLevel")} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  <input {...register("company")} placeholder="Thai Airways" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("positionLabel")}</label>
                  <input {...register("position")} placeholder="Flight Dispatcher" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">{t("yearsLabel")}</label>
                  <input type="number" {...register("years")} placeholder="2" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
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
                  label={t("docSlipLabel")}
                  type="APPLICATION_FEE_SLIP"
                  onUploadSuccess={handleDocumentUpload}
                  onRemove={() => handleDocumentRemove("APPLICATION_FEE_SLIP")}
                />
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
              <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
                {isSubmitting ? t("submitting") : t("submitApplication")}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
