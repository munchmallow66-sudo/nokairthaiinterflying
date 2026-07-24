"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "glass" | "outline" | "minimal";
  className?: string;
}

export function LanguageSwitcher({
  variant = "glass",
  className,
}: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  const handleSetTh = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setLanguage("th");
    },
    [setLanguage]
  );

  const handleSetEn = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setLanguage("en");
    },
    [setLanguage]
  );

  const handleWrapperClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLanguage();
    },
    [toggleLanguage]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleLanguage();
      }
    },
    [toggleLanguage]
  );

  return (
    <div
      onClick={handleWrapperClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Switch language. Current: ${language === "th" ? "Thai" : "English"}`}
      style={{ position: "relative", zIndex: 9999, isolation: "isolate" }}
      className={cn(
        "relative inline-flex items-center rounded-full p-1 border text-xs font-semibold shadow-lg transition-all duration-300 select-none cursor-pointer group hover:shadow-[0_0_20px_rgba(200,162,74,0.4)]",
        variant === "glass" &&
          "bg-tif-navy/95 border-tif-gold/40 text-slate-200 hover:border-tif-gold hover:bg-tif-navyDark",
        variant === "outline" &&
          "bg-white border-slate-300 text-slate-700 hover:border-tif-gold shadow-sm",
        variant === "minimal" &&
          "bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-tif-gold/50",
        className
      )}
    >
      {/* Globe Icon with smooth spin hover */}
      <div className="flex items-center justify-center pl-2 pr-1 text-tif-gold">
        <Globe className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
      </div>

      {/* Track Container */}
      <div className="relative flex items-center bg-slate-950/50 rounded-full p-0.5 border border-tif-gold/20">
        {/* Sliding Gold Pill Indicator */}
        <div
          className={cn(
            "absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r from-amber-400 via-tif-gold to-yellow-500 shadow-[0_0_12px_rgba(200,162,74,0.6)] transition-all duration-300 ease-out",
            language === "th"
              ? "left-0.5 w-[38px]"
              : "left-[40px] w-[38px]"
          )}
        />

        {/* TH Option */}
        <span
          role="button"
          onClick={handleSetTh}
          className={cn(
            "relative z-10 flex items-center justify-center w-[38px] py-1 rounded-full text-[11px] font-extrabold tracking-wider transition-colors duration-200 cursor-pointer",
            language === "th"
              ? "text-tif-navyDark"
              : "text-slate-300 hover:text-white"
          )}
        >
          TH
        </span>

        {/* EN Option */}
        <span
          role="button"
          onClick={handleSetEn}
          className={cn(
            "relative z-10 flex items-center justify-center w-[38px] py-1 rounded-full text-[11px] font-extrabold tracking-wider transition-colors duration-200 cursor-pointer",
            language === "en"
              ? "text-tif-navyDark"
              : "text-slate-300 hover:text-white"
          )}
        >
          EN
        </span>
      </div>
    </div>
  );
}
