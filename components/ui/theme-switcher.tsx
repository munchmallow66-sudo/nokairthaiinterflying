"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border shadow-sm cursor-pointer ${
        theme === "light"
          ? "bg-white/90 text-slate-800 border-slate-300 hover:bg-slate-100"
          : "bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-slate-800"
      }`}
      title={theme === "light" ? "สลับเป็นโหมดมืด" : "สลับเป็นโหมดสว่าง"}
    >
      {theme === "light" ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>โหมดสว่าง</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-amber-400" />
          <span>โหมดมืด</span>
        </>
      )}
    </button>
  );
}
