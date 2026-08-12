"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
  requireMatchText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการลบข้อมูล",
  description = "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
  itemName,
  confirmText = "ยืนยันการลบ",
  cancelText = "ยกเลิก",
  isLoading = false,
  variant = "danger",
  requireMatchText,
}: ConfirmModalProps) {
  const [typedText, setTypedText] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setTypedText("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isMatchValid = !requireMatchText || typedText.trim() === requireMatchText.trim();
  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()}
      />

      {/* Dialog Window */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col border",
          "bg-slate-900 border-slate-800 text-slate-100"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "p-3 rounded-2xl shrink-0 border flex items-center justify-center shadow-inner",
              isDanger
                ? "bg-rose-500/15 border-rose-500/30 text-rose-500"
                : "bg-amber-500/15 border-amber-500/30 text-amber-500"
            )}
          >
            {isDanger ? (
              <Trash2 className="h-6 w-6 animate-pulse" />
            ) : (
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            )}
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-lg font-bold font-display text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Item Details Box */}
        {itemName && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-950/80 border-l-4 border-l-rose-500 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              รายการที่เลือก:
            </span>
            <span className="text-sm font-bold text-slate-100 break-words">
              {itemName}
            </span>
          </div>
        )}

        {/* Require Match Text Input if specified */}
        {requireMatchText && (
          <div className="mb-4 space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">
              พิมพ์ <span className="font-bold text-rose-400 select-all">{requireMatchText}</span> เพื่อยืนยัน:
            </label>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requireMatchText}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isLoading || !isMatchValid}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              isDanger
                ? "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 shadow-rose-950/50"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950/50"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
