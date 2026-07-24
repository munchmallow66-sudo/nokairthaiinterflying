"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface StepIndicatorProps {
  currentStep: number;
  steps: { id: number; title: string; subtitle: string }[];
  onStepClick: (stepId: number) => void;
}

export function StepIndicator({ currentStep, steps, onStepClick }: StepIndicatorProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8">
      {/* Desktop Stepper */}
      <div className="hidden lg:grid grid-cols-9 gap-2">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => isCompleted && onStepClick(step.id)}
              disabled={!isCompleted && !isCurrent}
              className={cn(
                "flex flex-col items-center text-center p-2 rounded-xl transition-all",
                isCurrent && "bg-tif-navy text-white shadow-md scale-105",
                isCompleted && "hover:bg-amber-50 cursor-pointer text-slate-700",
                !isCompleted && !isCurrent && "opacity-50 cursor-not-allowed text-slate-400"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all mb-1",
                  isCurrent && "bg-tif-gold text-tif-navyDark ring-2 ring-tif-gold/50",
                  isCompleted && "bg-emerald-500 text-white",
                  !isCompleted && !isCurrent && "bg-slate-200 text-slate-600"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span className="text-[10px] font-bold truncate max-w-full leading-tight">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Stepper Header */}
      <div className="lg:hidden flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-tif-gold uppercase tracking-wider block">
            {language === "th" ? `ขั้นตอนที่ ${currentStep} จาก 9` : `Step ${currentStep} of 9`}
          </span>
          <h4 className="text-base font-bold text-tif-navy font-display">
            {steps[currentStep - 1]?.title}: {steps[currentStep - 1]?.subtitle}
          </h4>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tif-navy text-tif-gold font-bold text-sm">
          {currentStep}/9
        </div>
      </div>
    </div>
  );
}
