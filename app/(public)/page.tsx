"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  UserCheck,
  GraduationCap,
  Stethoscope,
  FileText,
  CreditCard,
  Bell,
  Trophy,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Search,
  Compass,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Card3D } from "@/components/ui/card-3d";
import { Mascot3D } from "@/components/ui/mascot-3d";
import { AnnouncementPopup } from "@/components/home/announcement-popup";
import { RecruitmentJourney } from "@/components/home/recruitment-journey";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] selection:bg-tif-gold selection:text-tif-navyDark overflow-x-hidden">
      {/* Announcement Modal Popup overlay */}
      <AnnouncementPopup />
      {/* ================================================================ */}
      {/* 1. HERO — Full-bleed 3D Interactive Storytelling Experience      */}
      {/* ================================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-tif-navyDark">
        {/* Cockpit Sunset Image Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/cockpit-bg.jpg"
            alt="Commercial pilot cockpit sunset training"
            fill
            priority
            className="object-cover object-right opacity-90 scale-105 transition-transform duration-1000"
            sizes="100vw"
          />
          {/* Left Dark Gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-tif-navyDark via-tif-navyDark/95 via-40% to-transparent to-70%" />
          {/* Bottom fade into page background */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5]/50 to-transparent pointer-events-none" />
          {/* Subtle gold accent line top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-tif-gold/50 to-transparent" />
        </div>        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-28 sm:pt-36 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Storytelling Headline & CTAs (col-7) */}
            <div className="lg:col-span-7 space-y-8">

              {/* 3D Kinetic Headline with Metallic Gold Shimmer */}
              <h1 className="text-3xl min-[380px]:text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight font-display leading-[1.15] text-white [perspective:1000px]">
                <span className="block animate-word-3d" style={{ animationDelay: "0.1s" }}>
                  {t("heroTitle").includes("ด้วย")
                    ? t("heroTitle").split("ด้วย")[0]
                    : t("heroTitle").replace("with World-Class Excellence", "")}
                </span>
                <span
                  className="block gold-shimmer-text animate-word-3d mt-1"
                  style={{ animationDelay: "0.3s" }}
                >
                  {t("heroTitle").includes("ด้วย")
                    ? `ด้วย${t("heroTitle").split("ด้วย")[1]}`
                    : "with World-Class Excellence"}
                </span>
              </h1>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2 animate-hero-cta">
                <Link href="/apply">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full sm:w-auto text-base font-bold group shadow-gold hover:scale-[1.03] transition-all duration-300 rounded-full px-8 py-3.5"
                  >
                    {t("startAdmission")}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/track">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold border-white/25 text-white bg-white/5 backdrop-blur-sm hover:bg-white hover:text-tif-navy transition-all duration-300 rounded-full px-8 py-3.5"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {t("trackStatus")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive 3D Floating Mascot (col-5) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <Mascot3D
                src="/mascot.png"
                alt="Thai Inter Flying Official Mascot"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* RECRUITMENT JOURNEY ROADMAP (Phase 1 - Phase 4)                 */}
      {/* ================================================================ */}
      <RecruitmentJourney />

      {/* ================================================================ */}
      {/* 2. SECTION 01 — PROCESS (Horizontal Flow & Motion Timeline)     */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-32">
        <ScrollReveal direction="up" distance={40}>
          {/* Section Header with Editorial Watermark */}
          <div className="flex items-end justify-between mb-14 lg:mb-20 relative">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase">01 — Process</span>
                <span className="h-px w-12 bg-tif-gold/40" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-tif-navy font-display tracking-tight leading-tight">
                {t("appStepsTitle")}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("appStepsSub")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 3D Motion Timeline Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[42px] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-tif-gold/20 via-tif-gold to-tif-gold/20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Step 1 */}
            <ScrollReveal delay={100} direction="up">
              <Card3D className="editorial-bento-card p-7 space-y-5 text-center md:text-left h-full">
                <div className="flex md:justify-start justify-center">
                  <div className="relative w-16 h-16 rounded-2xl bg-tif-navy text-tif-gold shadow-luxury flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-tif-gold text-tif-navyDark text-xs font-extrabold flex items-center justify-center font-display shadow-md">
                      1
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-tif-navy font-display">
                    {t("appStep1Title")}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t("appStep1Desc")}
                  </p>
                </div>
              </Card3D>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={250} direction="up">
              <Card3D className="editorial-bento-card p-7 space-y-5 text-center md:text-left h-full">
                <div className="flex md:justify-start justify-center">
                  <div className="relative w-16 h-16 rounded-2xl bg-tif-navy text-tif-gold shadow-luxury flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-tif-gold text-tif-navyDark text-xs font-extrabold flex items-center justify-center font-display shadow-md">
                      2
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-tif-navy font-display">
                    {t("appStep2Title")}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t("appStep2Desc")}
                  </p>
                </div>
              </Card3D>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={400} direction="up">
              <Card3D className="editorial-bento-card p-7 space-y-5 text-center md:text-left h-full">
                <div className="flex md:justify-start justify-center">
                  <div className="relative w-16 h-16 rounded-2xl bg-tif-navy text-tif-gold shadow-luxury flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-tif-gold text-tif-navyDark text-xs font-extrabold flex items-center justify-center font-display shadow-md">
                      3
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-tif-navy font-display">
                    {t("appStep3Title")}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t("appStep3Desc")}
                  </p>
                </div>
              </Card3D>
            </ScrollReveal>
          </div>
        </div>
      </section>



      {/* ================================================================ */}
      {/* 3. SECTION 02 — REQUIREMENTS (Interactive 3D Bento Grid)        */}
      {/* ================================================================ */}
      {/* bg is near-opaque, so no backdrop-filter: a full-width blurred backdrop
          is re-sampled on every scroll frame in Safari. */}
      <section className="mt-24 lg:mt-32 bg-white/90 border-y border-slate-200/70 py-24 lg:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <ScrollReveal direction="up">
            {/* Section header */}
            <div className="space-y-4 max-w-2xl mb-16">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase">02 — Requirements</span>
                <span className="h-px w-12 bg-tif-gold/40" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-tif-navy font-display tracking-tight leading-tight">
                {t("qualificationsTitle")}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("qualificationsSub")}
              </p>
            </div>
          </ScrollReveal>

          {/* 7/5 Asymmetric 3D Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left — 2 detail cards (col-7) */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal delay={100} direction="up">
                <Card3D className="editorial-bento-card p-7 lg:p-8 space-y-5">
                  <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
                    <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                      <UserCheck className="h-5 w-5 text-tif-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-tif-navy font-display">
                      {t("qualSection1Title")}
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {[
                      t("qualSec1Item1"),
                      t("qualSec1Item2"),
                      t("qualSec1Item3"),
                      t("qualSec1Item4"),
                      t("qualSec1Item5"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-tif-gold shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card3D>
              </ScrollReveal>

              <ScrollReveal delay={200} direction="up">
                <Card3D className="editorial-bento-card p-7 lg:p-8 space-y-5">
                  <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
                    <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-tif-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-tif-navy font-display">
                      {t("qualSection2Title")}
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-tif-gold shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{t("qualSec2Item1")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-tif-gold shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{t("qualSec2Item2")}</span>
                    </li>
                  </ul>

                  {/* Score Badges */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center space-y-1 shadow-sm hover:border-tif-gold transition-colors">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">TOEIC</span>
                      <span className="text-2xl font-extrabold text-tif-navy font-display">650+</span>
                      <span className="text-[10px] text-slate-400 block">Public Test</span>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center space-y-1 shadow-sm hover:border-tif-gold transition-colors">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">IELTS Academic</span>
                      <span className="text-2xl font-extrabold text-tif-navy font-display">5.5+</span>
                      <span className="text-[10px] text-slate-400 block">Academic Only</span>
                    </div>
                  </div>
                </Card3D>
              </ScrollReveal>
            </div>

            {/* Right — Medical Assessment Card (col-5) */}
            <div className="lg:col-span-5">
              <ScrollReveal delay={150} direction="up">
                <Card3D className="editorial-bento-card p-7 lg:p-8 space-y-6 h-full">
                  <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
                    <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                      <Stethoscope className="h-5 w-5 text-tif-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-tif-navy font-display">
                      {t("qualSection3Title")}
                    </h3>
                  </div>

                  {/* Height Stat */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-center shadow-sm">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                      {t("language") === "th" ? "ส่วนสูงขั้นต่ำ" : "MINIMUM HEIGHT"}
                    </span>
                    <span className="text-xl font-extrabold text-tif-navy font-display mt-0.5 block">
                      ≥ 160 cm
                    </span>
                  </div>

                  <ul className="space-y-3.5">
                    {[
                      t("qualSec3Item2"),
                      t("qualSec3Item3"),
                      t("qualSec3Item5"),
                      t("qualSec3Item6"),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-tif-gold shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card3D>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. SECTION 03 — DOCUMENTS (Editorial Ledger & Motion Cards)    */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-32">
        <ScrollReveal direction="up">
          {/* Section header */}
          <div className="space-y-4 max-w-2xl mb-16">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase">03 — Documents</span>
              <span className="h-px w-12 bg-tif-gold/40" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-tif-navy font-display tracking-tight leading-tight">
              {t("reqDocsTitle")}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("reqDocsSub")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Document Checklist (col-7) */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={100} direction="up">
              <Card3D className="editorial-bento-card p-7 lg:p-8 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                    <FileCheck className="h-5 w-5 text-tif-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-tif-navy font-display">{t("reqDocsTitle")}</h3>
                    <p className="text-xs text-tif-goldDark font-semibold mt-0.5">PDF Format • Certified True Copies</p>
                  </div>
                </div>

                <ul className="space-y-3.5">
                  {[
                    { num: 1, text: t("reqDoc1") },
                    { num: 2, text: t("reqDoc2") },
                    { num: 3, text: t("reqDoc3") },
                    { num: 4, text: t("reqDoc4") },
                    { num: 5, text: t("reqDoc5") },
                    {
                      num: 6,
                      text: t("reqDoc6"),
                      subItems: [t("reqDoc6a"), t("reqDoc6b"), t("reqDoc6c")],
                    },
                    { num: 7, text: t("reqDoc7") },
                  ].map((docItem) => (
                    <li key={docItem.num} className="space-y-1.5">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-tif-navy/5 border border-tif-navy/10 text-tif-navy text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {docItem.num}
                        </span>
                        <span className="text-sm text-slate-800 leading-relaxed font-medium">
                          {docItem.text.replace(/^\d+\.\s*/, "")}
                        </span>
                      </div>

                      {docItem.subItems && (
                        <div className="ml-9 pl-3.5 border-l-2 border-tif-gold/30 space-y-1 text-xs text-slate-600">
                          {docItem.subItems.map((sub, idx) => (
                            <p key={idx} className="leading-relaxed">
                              {sub}
                            </p>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 font-semibold leading-relaxed">
                  {t("reqDocNote")}
                </div>
              </Card3D>
            </ScrollReveal>
          </div>

          {/* Verification Process Sidebar (col-5) */}
          <div className="lg:col-span-5">
            <ScrollReveal delay={200} direction="up">
              <Card3D className="editorial-bento-card p-7 lg:p-8 space-y-6">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-5 w-5 text-tif-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-tif-navy font-display">{t("docVerificationTitle")}</h3>
                    <p className="text-xs text-tif-goldDark font-semibold mt-0.5">Official Verification Guidelines</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Step 01 */}
                  <div className="relative pl-10 space-y-1.5">
                    <span className="absolute left-0 top-0 w-7 h-7 rounded-lg bg-tif-navy/5 border border-tif-navy/10 text-tif-navy text-[11px] font-extrabold flex items-center justify-center font-display">01</span>
                    <p className="text-[11px] font-bold text-tif-navy uppercase tracking-wider">PDF Submission</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{t("docVerif1")}</p>
                  </div>

                  {/* Connector */}
                  <div className="ml-3.5 h-4 w-px bg-slate-200" />

                  {/* Step 02 */}
                  <div className="relative pl-10 space-y-1.5">
                    <span className="absolute left-0 top-0 w-7 h-7 rounded-lg bg-tif-navy/5 border border-tif-navy/10 text-tif-navy text-[11px] font-extrabold flex items-center justify-center font-display">02</span>
                    <p className="text-[11px] font-bold text-tif-navy uppercase tracking-wider">Original Verification</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{t("docVerif2")}</p>
                  </div>

                  {/* Connector */}
                  <div className="ml-3.5 h-4 w-px bg-slate-200" />

                  {/* Step 03 */}
                  <div className="relative pl-10 space-y-1.5">
                    <span className="absolute left-0 top-0 w-7 h-7 rounded-lg bg-tif-navy/5 border border-tif-navy/10 text-tif-navy text-[11px] font-extrabold flex items-center justify-center font-display">03</span>
                    <p className="text-[11px] font-bold text-tif-navy uppercase tracking-wider">Email Notification</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{t("docVerif3")}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-1.5">
                  <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Notice • Policy</p>
                  <p className="text-sm text-rose-800 leading-relaxed font-medium">{t("docVerif4")}</p>
                </div>
              </Card3D>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. SECTION 04 — POLICIES (Asymmetric Bento Motion Grid)        */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-32 pb-24 lg:pb-32">
        <ScrollReveal direction="up">
          {/* Section header */}
          <div className="space-y-4 max-w-2xl mb-16">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase">04 — Policies</span>
              <span className="h-px w-12 bg-tif-gold/40" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-tif-navy font-display tracking-tight leading-tight">
              {t("impNotesTitle")}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("impNotesSub")}
            </p>
          </div>
        </ScrollReveal>

        {/* Bento grid — 2 large + 2 small for visual hierarchy */}
        <ScrollReveal delay={150} direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Note 1 — large (col-span-2) */}
            <Card3D className="lg:col-span-2 editorial-bento-card p-7 lg:p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5 text-tif-gold" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-tif-navy font-display leading-snug">
                    {t("impNote1Title")}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t("impNote1Desc")}
                  </p>
                </div>
              </div>
            </Card3D>

            {/* Note 2 — small (col-span-1) */}
            <Card3D className="editorial-bento-card p-7 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center">
                <Trophy className="h-5 w-5 text-tif-gold" />
              </div>
              <h3 className="text-base font-bold text-tif-navy font-display leading-snug">
                {t("impNote2Title")}
              </h3>
              <div className="space-y-2">
                {t("impNote2Desc1") && (
                  <p className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                    <span className="text-tif-goldDark font-bold shrink-0">•</span>
                    <span>{t("impNote2Desc1")}</span>
                  </p>
                )}
                {t("impNote2Desc2") && (
                  <p className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                    <span className="text-tif-goldDark font-bold shrink-0">•</span>
                    <span>{t("impNote2Desc2")}</span>
                  </p>
                )}
              </div>
            </Card3D>

            {/* Note 3 — small (col-span-1) */}
            <Card3D className="editorial-bento-card p-7 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-tif-gold" />
              </div>
              <h3 className="text-base font-bold text-tif-navy font-display leading-snug">
                {t("impNote3Title")}
              </h3>
              <div className="space-y-2">
                <p className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="text-tif-goldDark font-bold shrink-0">•</span>
                  <span>{t("impNote3Desc1")}</span>
                </p>
                <p className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="text-tif-goldDark font-bold shrink-0">•</span>
                  <span>{t("impNote3Desc2")}</span>
                </p>
              </div>
            </Card3D>

            {/* Note 4 — large (col-span-2) */}
            <Card3D className="lg:col-span-2 editorial-bento-card p-7 lg:p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-tif-gold" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-tif-navy font-display leading-snug">
                    {t("impNote4Title")}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t("impNote4Desc")}
                  </p>
                </div>
              </div>
            </Card3D>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
