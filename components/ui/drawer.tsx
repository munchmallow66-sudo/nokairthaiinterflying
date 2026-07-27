"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "left";
  size?: "md" | "lg" | "xl";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  size = "lg",
}: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-3xl",
  };

  const sideClasses = {
    right: "right-0 border-l",
    left: "left-0 border-r",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-tif-navyDark/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed top-0 bottom-0 z-10 w-full bg-slate-950 shadow-2xl transition-transform duration-300 border-slate-800 p-6 overflow-y-auto text-slate-100",
          sideClasses[side],
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h3 className="text-xl font-bold text-white font-display">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
