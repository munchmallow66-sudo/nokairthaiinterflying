import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "gold"
    | "success"
    | "warning"
    | "danger"
    | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-tif-navy text-white",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    gold: "bg-amber-100 text-amber-900 border border-amber-300 font-semibold",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-rose-100 text-rose-800 border border-rose-300",
    info: "bg-sky-100 text-sky-800 border border-sky-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
