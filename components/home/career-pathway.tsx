"use client";

import React from "react";
import {
  Plane,
  Award,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Card3D } from "@/components/ui/card-3d";

export function CareerPathway() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-16 lg:pt-24 pb-8">
      <ScrollReveal direction="up" distance={35}>
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100/80 border border-slate-200/90 p-8 sm:p-12 lg:p-14 text-slate-800 shadow-xl overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="ambient-orb absolute -top-40 -right-40 w-[32rem] h-[32rem] bg-[radial-gradient(closest-side,rgba(200,162,74,0.15),transparent_100%)]" />
          <div className="ambient-orb absolute -bottom-40 -left-40 w-[32rem] h-[32rem] bg-[radial-gradient(closest-side,rgba(10,35,66,0.05),transparent_100%)]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Storytelling & Pathway Headline (col-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-tif-gold/15 border border-tif-gold/40 text-tif-navyDark text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
                <TrendingUp className="w-4 h-4 text-tif-goldDark" />
                <span>{t("careerPathwayBadge")}</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold font-display tracking-tight text-tif-navy leading-tight">
                  {t("careerPathwayHeadline")}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  {t("careerPathwaySub")}
                </p>
              </div>

              {/* Intro paragraph */}
              <div className="border-l-2 border-tif-gold pl-4 py-1">
                <p className="text-slate-700 text-sm sm:text-base font-semibold leading-relaxed">
                  {t("careerPathwayIntro")}
                </p>
              </div>

              {/* Highlights List / Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white border border-slate-200/90 shadow-sm px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:border-tif-gold/50 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-tif-goldDark" />
                  <span>Performance-Based Progression</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200/90 shadow-sm px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:border-tif-gold/50 transition-colors">
                  <Award className="w-4 h-4 text-tif-goldDark" />
                  <span>Nok Air Official Partner</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200/90 shadow-sm px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:border-tif-gold/50 transition-colors">
                  <UserCheck className="w-4 h-4 text-tif-goldDark" />
                  <span>Top-Tier Selection</span>
                </div>
              </div>

            </div>

            {/* Right Column: Direct Entry Card Highlight (col-5) */}
            <div className="lg:col-span-5">
              <Card3D glowColor="rgba(200, 162, 74, 0.2)" className="h-full">
                <div className="rounded-2xl bg-white border border-slate-200/90 p-7 sm:p-8 space-y-5 shadow-xl relative group overflow-hidden hover:border-tif-gold/50 transition-all duration-300">
                  
                  {/* Glowing Top Corner Badge */}
                  <div className="absolute top-0 right-0 bg-tif-navy text-tif-gold text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-sm">
                    Direct Entry
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-tif-navy text-tif-gold flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Plane className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-tif-navy font-display flex items-center gap-2">
                      <span>{t("directEntryTitle")}</span>
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-normal">
                      {t("directEntryDesc")}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 text-tif-goldDark font-bold">
                      <Sparkles className="w-4 h-4 text-tif-gold" />
                      CPL Program Graduate Route
                    </span>
                    <ChevronRight className="w-4 h-4 text-tif-goldDark group-hover:translate-x-1 transition-transform" />
                  </div>

                </div>
              </Card3D>
            </div>

          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
