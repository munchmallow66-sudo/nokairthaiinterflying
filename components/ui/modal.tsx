"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  variant?: "dark" | "light";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
  variant = "light",
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  const isDark = variant === "dark";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-tif-navyDark/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div
        className={cn(
          "relative w-full rounded-2xl p-4 sm:p-5 shadow-2xl transition-all z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto max-h-[calc(100vh-100px)] overflow-hidden",
          isDark
            ? "bg-slate-900 border border-slate-800 text-slate-100"
            : "bg-white border border-slate-200 text-slate-900",
          widthClasses[maxWidth]
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between pb-2 border-b mb-2.5 shrink-0",
            isDark ? "border-slate-800" : "border-slate-100"
          )}
        >
          <div>
            {title && (
              <h3
                className={cn(
                  "text-sm sm:text-base font-bold font-display leading-snug",
                  isDark ? "text-white" : "text-tif-navy"
                )}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                className={cn(
                  "text-[11px] mt-0.5 font-medium",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              "rounded-full p-1 transition shrink-0 ml-2",
              isDark
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            )}
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 pr-0.5 space-y-2.5 text-xs font-sans">
          {children}
        </div>
      </div>
    </div>
  );
}
