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
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-tif-navyDark/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div
        className={cn(
          "relative w-full rounded-2xl bg-slate-900 p-4 sm:p-6 shadow-2xl transition-all z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-800 text-slate-100 max-h-[85vh] flex flex-col my-auto overflow-hidden",
          widthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 shrink-0">
          <div>
            {title && (
              <h3 className="text-base sm:text-xl font-bold text-white font-display">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] pr-1.5 space-y-3 text-xs font-sans shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
