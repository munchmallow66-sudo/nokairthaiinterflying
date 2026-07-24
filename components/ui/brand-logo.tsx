"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "light" | "dark" | "full";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function BrandLogo({
  className,
  variant = "light",
  size = "md",
  showText = true,
}: BrandLogoProps) {
  const sizeMap = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-20",
  };

  const textSizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div className={cn("inline-flex items-center space-x-3 group", className)}>
      {/* Official TIF Emblem Image */}
      <img
        src="/logo.png"
        alt="Thai Inter Flying Official Logo"
        className={cn(
          "w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
          sizeMap[size]
        )}
      />

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-extrabold tracking-wider font-display uppercase leading-none",
              variant === "dark" ? "text-tif-navy" : "text-white",
              textSizeMap[size]
            )}
          >
            THAI INTER FLYING
          </span>
        </div>
      )}
    </div>
  );
}
