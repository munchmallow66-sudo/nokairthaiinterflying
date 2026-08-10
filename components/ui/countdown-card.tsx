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
    // Target deadline: September 17, 2026 23:59:59 (ICT +07:00)
    const targetDate = new Date("2026-09-17T23:59:59+07:00").getTime();

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
    <div className="glass-card rounded-3xl p-4 sm:p-8 border border-tif-gold/30 shadow-xl relative overflow-hidden group bg-white">
      {/* Background Ambient Glows */}
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-tif-gold/10 rounded-full blur-3xl group-hover:bg-tif-gold/20 transition-all duration-700 pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-tif-navy/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Info */}
        <div className="space-y-3 text-center lg:text-left max-w-xl">
          <h3 className="text-xl sm:text-3xl font-extrabold text-tif-navy font-display tracking-tight leading-snug">
            {t("countdownTitle")}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
            {t("countdownSub")}
          </p>
        </div>

        {/* Right Digital Countdown Blocks */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-auto">
          <div className="grid grid-cols-4 gap-1.5 min-[380px]:gap-2.5 sm:gap-4 text-center w-full max-w-md">
            {/* Days Block */}
            <div className="bg-tif-navy rounded-2xl p-2 min-[380px]:p-3 sm:p-4 border border-tif-gold/30 shadow-md relative group/block">
              <div className="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold text-tif-gold font-display gold-gradient-text">
                {formatNumber(timeLeft.days)}
              </div>
              <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider block mt-1">
                {t("daysUnit")}
              </span>
            </div>

            {/* Hours Block */}
            <div className="bg-tif-navy rounded-2xl p-2 min-[380px]:p-3 sm:p-4 border border-tif-gold/30 shadow-md relative group/block">
              <div className="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold text-tif-gold font-display gold-gradient-text">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider block mt-1">
                {t("hoursUnit")}
              </span>
            </div>

            {/* Minutes Block */}
            <div className="bg-tif-navy rounded-2xl p-2 min-[380px]:p-3 sm:p-4 border border-tif-gold/30 shadow-md relative group/block">
              <div className="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold text-tif-gold font-display gold-gradient-text">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider block mt-1">
                {t("minutesUnit")}
              </span>
            </div>

            {/* Seconds Block */}
            <div className="bg-tif-navy rounded-2xl p-2 min-[380px]:p-3 sm:p-4 border border-tif-gold/30 shadow-md relative group/block">
              <div className="text-xl min-[380px]:text-2xl sm:text-4xl font-extrabold text-tif-gold font-display gold-gradient-text">
                {formatNumber(timeLeft.seconds)}
              </div>
              <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider block mt-1">
                {t("secondsUnit")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
