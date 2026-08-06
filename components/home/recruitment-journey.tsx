"use client";

import React, { useState } from "react";
import {
  Plane,
  FileText,
  GraduationCap,
  Stethoscope,
  Rocket,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Clock,
  MapPin,
  Sparkles,
  UserCheck,
  CreditCard,
  Building,
  Award,
  LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Card3D } from "@/components/ui/card-3d";

interface PhaseItem {
  date: string;
  title: string;
  desc?: string;
  icon: LucideIcon;
  highlight?: boolean;
  isEvent?: boolean;
  isSpecial?: boolean;
  subItems?: string[];
  note?: string;
}

interface Phase {
  id: number;
  phaseNum: string;
  title: string;
  subtitle: string;
  dates: string;
  icon: LucideIcon;
  badgeBg: string;
  items: PhaseItem[];
}

export function RecruitmentJourney() {
  const { t } = useLanguage();
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const phases: Phase[] = [
    {
      id: 1,
      phaseNum: "01",
      title: t("phase1Title"),
      subtitle: t("phase1Sub"),
      dates: t("phase1Dates"),
      icon: FileText,
      badgeBg: "bg-tif-gold/15 text-tif-navyDark border-tif-gold/40",
      items: [
        {
          date: t("p1Item1Date"),
          title: t("p1Item1Title"),
          icon: Calendar,
          highlight: true,
          subItems: [
            t("p1Item1Sub1"),
            t("p1Item1Sub2"),
            t("p1Item1Sub3"),
          ],
          note: t("p1Item1Note"),
        },
        {
          date: t("p1Item2Date"),
          title: t("p1Item2Title"),
          desc: t("p1Item2Desc"),
          icon: Building,
          isEvent: true,
        },
        {
          date: t("p1Item3Date"),
          title: t("p1Item3Title"),
          desc: t("p1Item3Desc"),
          icon: Clock,
        },
        {
          date: t("p1Item4Date"),
          title: t("p1Item4Title"),
          desc: t("p1Item4Desc"),
          icon: MapPin,
          highlight: true,
        },
      ],
    },
    {
      id: 2,
      phaseNum: "02",
      title: t("phase2Title"),
      subtitle: t("phase2Sub"),
      dates: t("phase2Dates"),
      icon: GraduationCap,
      badgeBg: "bg-tif-navy/10 text-tif-navy border-tif-navy/20",
      items: [
        {
          date: t("p2Item1Date"),
          title: t("p2Item1Title"),
          desc: t("p2Item1Desc"),
          icon: GraduationCap,
          highlight: true,
        },
        {
          date: t("p2Item2Date"),
          title: t("p2Item2Title"),
          desc: t("p2Item2Desc"),
          icon: Award,
        },
        {
          date: t("p2Item3Date"),
          title: t("p2Item3Title"),
          desc: t("p2Item3Desc"),
          icon: UserCheck,
          highlight: true,
        },
        {
          date: t("p2Item4Date"),
          title: t("p2Item4Title"),
          desc: t("p2Item4Desc"),
          icon: CheckCircle2,
        },
      ],
    },
    {
      id: 3,
      phaseNum: "03",
      title: t("phase3Title"),
      subtitle: t("phase3Sub"),
      dates: t("phase3Dates"),
      icon: Stethoscope,
      badgeBg: "bg-tif-gold/15 text-tif-navyDark border-tif-gold/40",
      items: [
        {
          date: t("p3Item1Date"),
          title: t("p3Item1Title"),
          desc: t("p3Item1Desc"),
          icon: Stethoscope,
          highlight: true,
        },
      ],
    },
    {
      id: 4,
      phaseNum: "04",
      title: t("phase4Title"),
      subtitle: t("phase4Sub"),
      dates: t("phase4Dates"),
      icon: Rocket,
      badgeBg: "bg-tif-navy text-tif-gold border-tif-gold/30",
      items: [
        {
          date: t("p4Item1Date"),
          title: t("p4Item1Title"),
          desc: t("p4Item1Desc"),
          icon: CreditCard,
          highlight: true,
        },
        {
          date: t("p4Item2Date"),
          title: t("p4Item2Title"),
          desc: t("p4Item2Desc"),
          icon: Plane,
          highlight: true,
          isSpecial: true,
        },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20 lg:pt-28 pb-6">
      {/* Section Header */}
      <ScrollReveal direction="up" distance={30}>
        <div className="space-y-4 max-w-3xl mb-12">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t("recruitmentJourneyBadge")}
            </span>
            <span className="h-px w-12 bg-tif-gold/40" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-tif-navy font-display tracking-tight leading-tight">
            {t("recruitmentJourneyTitle")}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t("recruitmentJourneySub")}
          </p>
        </div>
      </ScrollReveal>

      {/* Horizontal Phase Roadmap Banner / Selector */}
      <ScrollReveal delay={150} direction="up">
        <div className="mb-12 bg-tif-navyDark rounded-2xl p-4 sm:p-6 text-white shadow-2xl border border-tif-gold/30 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-tif-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3">
            {phases.map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.id}
                  onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                  className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    activePhase === phase.id
                      ? "bg-tif-navy border-tif-gold shadow-gold text-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-tif-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-tif-gold font-mono uppercase tracking-wider">
                      Phase {phase.phaseNum}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                      {phase.dates}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-tif-navy text-tif-gold flex items-center justify-center shrink-0 border border-tif-gold/30 group-hover:scale-110 transition-transform">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate font-display">
                        {phase.title.replace(/Phase \d+:\s*/, "")}
                      </h4>
                      <p className="text-[11px] text-slate-300 truncate">
                        {phase.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Flow Arrow for desktop */}
                  {idx < phases.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-tif-gold/40">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Grid of Detailed Phase Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {phases.map((phase, pIndex) => {
          const PhaseIcon = phase.icon;
          return (
            <ScrollReveal key={phase.id} delay={200 + pIndex * 100} direction="up">
              <Card3D className="editorial-bento-card p-6 sm:p-8 h-full space-y-6 relative flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Card Phase Header */}
                  <div className="flex items-start justify-between pb-5 border-b border-slate-200/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-tif-navy text-tif-gold flex items-center justify-center shrink-0 shadow-luxury border border-tif-gold/20">
                        <PhaseIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-tif-gold font-mono">
                            Phase {phase.phaseNum}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${phase.badgeBg}`}>
                            {phase.dates}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-tif-navy font-display mt-0.5">
                          {phase.title.replace(/Phase \d+:\s*/, "")}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Items Timeline inside Phase */}
                  <div className="space-y-5 relative pl-2">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-200" />

                    {phase.items.map((item, iIndex) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={iIndex} className="relative flex items-start gap-4 group">
                          {/* Dot / Icon */}
                          <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            item.highlight || item.isSpecial
                              ? "bg-tif-navy text-tif-gold border-tif-gold/40 shadow-md"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}>
                            <ItemIcon className="w-4.5 h-4.5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-1.5 pt-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-tif-navy bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                                {item.date}
                              </span>
                              {item.isEvent && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-tif-gold/15 text-tif-navyDark border border-tif-gold/40 px-2 py-0.5 rounded-full">
                                  Special Event
                                </span>
                              )}
                              {item.isSpecial && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-tif-navy text-tif-gold border border-tif-gold/30 px-2 py-0.5 rounded-full">
                                  Key Milestone
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-tif-navy font-display">
                              {item.title}
                            </h4>

                            {item.desc && (
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {item.desc}
                              </p>
                            )}

                            {/* Sub-items list (e.g. for Phase 1.1, 1.2, 1.3) */}
                            {item.subItems && item.subItems.length > 0 && (
                              <div className="mt-3 space-y-2 bg-slate-50 border border-slate-200/90 rounded-xl p-3.5">
                                {item.subItems.map((sub: string, sIdx: number) => (
                                  <div key={sIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                                    <CheckCircle2 className="w-4 h-4 text-tif-gold shrink-0 mt-0.5" />
                                    <span>{sub}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Important Note */}
                            {item.note && (
                              <div className="mt-2 flex items-start gap-2 bg-tif-gold/10 border border-tif-gold/30 text-tif-navyDark rounded-lg p-2.5 text-xs leading-relaxed">
                                <Info className="w-4 h-4 text-tif-goldDark shrink-0 mt-0.5" />
                                <span>{item.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer Badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Plane className="w-3.5 h-3.5 text-tif-gold" />
                    Cadet Pilot Selection Roadmap
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">
                    Step {phase.phaseNum} of 04
                  </span>
                </div>
              </Card3D>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
