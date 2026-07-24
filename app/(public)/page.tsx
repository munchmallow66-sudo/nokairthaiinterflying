"use client";

import Link from "next/link";
import {
  Plane,
  ShieldCheck,
  Award,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  UserCheck,
  GraduationCap,
  Stethoscope,
  FileText,
  CreditCard,
  ExternalLink,
  Globe,
  FileCheck,
  ShieldAlert,
  Bell,
  Trophy,
  DollarSign,
  Info,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { CountdownCard } from "@/components/ui/countdown-card";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-tif-navyDark justify-between space-y-20 pb-24">
      {/* Hero Section */}
      <section className="relative bg-tif-navyDark text-white py-12 lg:py-20 overflow-hidden flex-1 flex items-center">
        {/* Background Radial Aviation Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tif-navyLight/50 via-tif-navyDark to-tif-navyDark z-0 pointer-events-none" />

        {/* Animated Radar Circle BG Overlay */}
        <div className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full border border-tif-gold/10 pointer-events-none animate-radar-sweep flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-dashed border-tif-gold/15" />
          <div className="w-[300px] h-[300px] rounded-full border border-tif-gold/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-tif-gold shadow-[0_0_10px_#C8A24A]" />
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-tight text-white">
                <span className="block">{t("heroTitle")}</span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed font-light max-w-2xl">
                {t("heroDesc")}
              </p>

              {/* Shimmer Light CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/apply">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full sm:w-auto text-base relative overflow-hidden group shadow-[0_0_25px_rgba(200,162,74,0.4)]"
                  >
                    {/* Shimmer Sweep Animation Element */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep pointer-events-none" />
                    <span className="relative z-10 flex items-center font-bold">
                      {t("startAdmission")} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>

                <Link href="/track">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base border-tif-gold/40 text-tif-gold hover:bg-tif-gold hover:text-tif-navyDark font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.15)]"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    {t("trackStatus")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Flying Jet Card */}
            <div className="lg:col-span-5 relative">
              <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 shadow-2xl relative group">
                {/* Background Ambient Glow */}
                <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-tif-gold/10 rounded-full blur-3xl group-hover:bg-tif-gold/20 transition-all duration-500 pointer-events-none" />

                {/* Card Top Header Bar with Intake Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-700/60 mb-6">
                  <div className="flex items-center space-x-3.5">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shadow-inner shrink-0">
                      <Plane className="h-8 w-8 animate-plane-float filter drop-shadow-[0_0_8px_rgba(200,162,74,0.6)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white font-display leading-snug">Cadet Pilot Admission</h3>
                      <p className="text-[11px] text-tif-gold font-medium">CAAT ATO Certified Training</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-400 to-tif-gold text-tif-navyDark px-3 py-1 rounded-full font-extrabold text-[11px] shadow-[0_0_12px_rgba(200,162,74,0.4)] uppercase tracking-wider flex items-center space-x-1.5 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-tif-navyDark animate-pulse" />
                    <span>{t("intakeOpen")}</span>
                  </div>
                </div>

                {/* Application Fee Box */}
                <div className="bg-slate-950/60 rounded-2xl p-5 border border-tif-gold/20 flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">{t("applicationFeeTitle")}</span>
                    <span className="text-3xl font-extrabold text-white font-display gold-gradient-text">฿1,500</span>
                  </div>
                  <Link href="/apply">
                    <Button variant="gold" size="md" className="font-bold shadow-gold">
                      {t("applyNow")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Card Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <CountdownCard />
      </section>

      {/* Application Steps Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {t("appStepsTitle")}
          </h2>
          <p className="text-slate-300 text-sm font-light">
            {t("appStepsSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/20 hover:border-tif-gold/50 transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/30">
                <UserCheck className="h-6 w-6" />
              </div>
              <span className="text-3xl font-black font-display text-tif-gold/30 group-hover:text-tif-gold transition-colors">01</span>
            </div>
            <h3 className="text-lg font-bold text-white font-display">{t("appStep1Title")}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{t("appStep1Desc")}</p>
          </div>

          {/* Step 2 */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/20 hover:border-tif-gold/50 transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/30">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-3xl font-black font-display text-tif-gold/30 group-hover:text-tif-gold transition-colors">02</span>
            </div>
            <h3 className="text-lg font-bold text-white font-display">{t("appStep2Title")}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{t("appStep2Desc")}</p>
          </div>

          {/* Step 3 */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/20 hover:border-tif-gold/50 transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/30">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-3xl font-black font-display text-tif-gold/30 group-hover:text-tif-gold transition-colors">03</span>
            </div>
            <h3 className="text-lg font-bold text-white font-display">{t("appStep3Title")}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{t("appStep3Desc")}</p>
          </div>
        </div>
      </section>

      {/* Qualifications Cadet Pilot Program Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {t("qualificationsTitle")}
          </h2>
          <p className="text-slate-300 text-sm font-light">
            {t("qualificationsSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Personal Info */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/60">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white font-display">{t("qualSection1Title")}</h3>
              </div>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec1Item1")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec1Item2")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec1Item3")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec1Item4")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec1Item5")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Education & Language */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/60">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white font-display">{t("qualSection2Title")}</h3>
              </div>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec2Item1")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec2Item2")}</span>
                </li>
              </ul>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-tif-gold/20 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TOEIC Test</span>
                  <span className="text-xl font-extrabold text-tif-gold font-display">650+</span>
                  <span className="text-[9px] text-slate-400 block">Public Test Only</span>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-tif-gold/20 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">IELTS Academic</span>
                  <span className="text-xl font-extrabold text-tif-gold font-display">5.5+</span>
                  <span className="text-[9px] text-slate-400 block">Academic Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Medical Requirements */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/60">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white font-display">{t("qualSection3Title")}</h3>
              </div>

              {/* Height stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-tif-gold/20 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Male Height</span>
                  <span className="text-base font-extrabold text-white">≥ 165 cm</span>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-tif-gold/20 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Female Height</span>
                  <span className="text-base font-extrabold text-white">≥ 160 cm</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec3Item2")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec3Item3")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec3Item5")}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t("qualSec3Item6")}</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <a
                href="https://www.caat.or.th"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-slate-950/80 border border-tif-gold/30 text-tif-gold text-xs font-bold hover:bg-tif-gold hover:text-tif-navyDark transition-colors"
              >
                <span>CAAT Class 1 Medical Details</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {t("reqDocsTitle")}
          </h2>
          <p className="text-slate-300 text-sm font-light">
            {t("reqDocsSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Document Checklist Card */}
          <div className="lg:col-span-7 glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-display">{t("reqDocsTitle")}</h3>
                <p className="text-xs text-tif-gold">PDF Format • Certified True Copies</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc1")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc2")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc3")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc4")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc5")}</span>
              </li>
              <li className="space-y-2 pl-7 border-l-2 border-tif-gold/30 my-2">
                <span className="text-slate-100 font-semibold block">{t("reqDoc6")}</span>
                <span className="text-slate-300 block">{t("reqDoc6a")}</span>
                <span className="text-slate-300 block">{t("reqDoc6b")}</span>
                <span className="text-slate-300 block">{t("reqDoc6c")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc7")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{t("reqDoc8")}</span>
              </li>
            </ul>

            <div className="bg-slate-950/70 rounded-2xl p-4 border border-tif-gold/20 text-xs text-tif-gold font-semibold leading-relaxed">
              {t("reqDocNote")}
            </div>
          </div>

          {/* Verification Process Card */}
          <div className="lg:col-span-5 glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-display">{t("docVerificationTitle")}</h3>
                <p className="text-xs text-tif-gold">Official Verification Guidelines</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-tif-gold uppercase tracking-wider block">Step 01 • PDF Submission</span>
                <p>{t("docVerif1")}</p>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-tif-gold uppercase tracking-wider block">Step 02 • Original Verification</span>
                <p>{t("docVerif2")}</p>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-tif-gold uppercase tracking-wider block">Step 03 • Email Notification</span>
                <p>{t("docVerif3")}</p>
              </div>

              <div className="bg-rose-950/40 rounded-xl p-4 border border-rose-500/30 text-rose-200 font-medium space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Notice • Policy Disclaimer</span>
                <p>{t("docVerif4")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {t("impNotesTitle")}
          </h2>
          <p className="text-slate-300 text-sm font-light">
            {t("impNotesSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Note 1: Selection Results Notification */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-4 hover:border-tif-gold/60 transition-all duration-300 group">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-display leading-snug">
                {t("impNote1Title")}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {t("impNote1Desc")}
            </p>
          </div>

          {/* Note 2: Selection Results */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-4 hover:border-tif-gold/60 transition-all duration-300 group">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-display leading-snug">
                {t("impNote2Title")}
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-light">
              <p className="flex items-start space-x-2">
                <span className="text-tif-gold font-bold">•</span>
                <span>{t("impNote2Desc1")}</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-tif-gold font-bold">•</span>
                <span>{t("impNote2Desc2")}</span>
              </p>
            </div>
          </div>

          {/* Note 3: Program Costs */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-4 hover:border-tif-gold/60 transition-all duration-300 group">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-display leading-snug">
                {t("impNote3Title")}
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-light">
              <p className="flex items-start space-x-2">
                <span className="text-tif-gold font-bold">•</span>
                <span>{t("impNote3Desc1")}</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-tif-gold font-bold">•</span>
                <span>{t("impNote3Desc2")}</span>
              </p>
            </div>
          </div>

          {/* Note 4: Reservation of Rights */}
          <div className="glass-card-dark-glow rounded-3xl p-7 border border-tif-gold/30 space-y-4 hover:border-tif-gold/60 transition-all duration-300 group">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-700/60">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-display leading-snug">
                {t("impNote4Title")}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {t("impNote4Desc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
