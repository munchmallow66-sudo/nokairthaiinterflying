"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/language-context";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownCard() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    // Target deadline: August 31, 2026 23:59:59 (ICT +07:00)
    const targetDate = new Date("2026-08-31T23:59:59+07:00").getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="glass-card-dark-glow rounded-3xl p-8 border border-tif-gold/40 shadow-2xl relative overflow-hidden group">
      {/* Background Ambient Glows */}
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-tif-gold/15 rounded-full blur-3xl group-hover:bg-tif-gold/25 transition-all duration-700 pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-tif-navyLight/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Info */}
        <div className="space-y-3 text-center lg:text-left max-w-xl">


          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight leading-snug">
            {t("countdownTitle")}
          </h3>

          <p className="text-slate-300 text-sm font-light leading-relaxed">
            {t("countdownSub")}
          </p>
        </div>

        {/* Right Digital Countdown Blocks */}
        <div className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
            {/* Days Block */}
            <div className="bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-tif-gold/30 min-w-[72px] sm:min-w-[88px] shadow-inner relative group/block">
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-display gold-gradient-text">
                {formatNumber(timeLeft.days)}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                {t("daysUnit")}
              </span>
            </div>

            {/* Hours Block */}
            <div className="bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-tif-gold/30 min-w-[72px] sm:min-w-[88px] shadow-inner relative group/block">
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-display gold-gradient-text">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                {t("hoursUnit")}
              </span>
            </div>

            {/* Minutes Block */}
            <div className="bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-tif-gold/30 min-w-[72px] sm:min-w-[88px] shadow-inner relative group/block">
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-display gold-gradient-text">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                {t("minutesUnit")}
              </span>
            </div>

            {/* Seconds Block */}
            <div className="bg-slate-950/80 rounded-2xl p-3.5 sm:p-4 border border-tif-gold/30 min-w-[72px] sm:min-w-[88px] shadow-inner relative group/block">
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-display text-amber-400 animate-pulse">
                {formatNumber(timeLeft.seconds)}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-amber-400/80 uppercase tracking-wider block mt-1">
                {t("secondsUnit")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
