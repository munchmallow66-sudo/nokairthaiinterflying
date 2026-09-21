"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdmissionsContextType {
  isOpen: boolean;
  quota: number | null;
  acceptedCount: number;
  remaining: number | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AdmissionsContext = React.createContext<AdmissionsContextType | undefined>(
  undefined
);

/**
 * Fallback synchronous check using build-time env var.
 */
export function admissionsAreOpen(): boolean {
  return process.env.NEXT_PUBLIC_ADMISSIONS_OPEN === "true";
}

export function AdmissionsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState<boolean>(() => admissionsAreOpen());
  const [quota, setQuota] = React.useState<number | null>(1);
  const [acceptedCount, setAcceptedCount] = React.useState<number>(0);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admissions/status", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setIsOpen(Boolean(data.isOpen));
        setQuota(data.quota ?? null);
        setAcceptedCount(data.acceptedCount ?? 0);
        setRemaining(data.remaining ?? null);
      }
    } catch (err) {
      console.warn("Could not fetch real-time admission status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();

    // Re-check periodically every 20 seconds to keep clients in sync
    const interval = setInterval(fetchStatus, 20000);
    const onFocus = () => fetchStatus();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchStatus]);

  const value = React.useMemo(
    () => ({
      isOpen,
      quota,
      acceptedCount,
      remaining,
      isLoading,
      refresh: fetchStatus,
    }),
    [isOpen, quota, acceptedCount, remaining, isLoading, fetchStatus]
  );

  return (
    <AdmissionsContext.Provider value={value}>
      {children}
    </AdmissionsContext.Provider>
  );
}

/**
 * React hook to access live admission status and quota in any client component.
 */
export function useAdmissions(): AdmissionsContextType {
  const context = React.useContext(AdmissionsContext);
  if (!context) {
    return {
      isOpen: admissionsAreOpen(),
      quota: 1,
      acceptedCount: 0,
      remaining: null,
      isLoading: false,
      refresh: async () => {},
    };
  }
  return context;
}

/**
 * Apply CTA used across public pages (navbar, footer, hero, courses, career,
 * admission). When admissions are closed it renders a disabled button that says
 * "ปิดรับสมัคร / Admissions Closed" instead of linking to /apply.
 */
export function ApplyCta({
  label,
  variant = "gold",
  className = "",
  size = "md",
  onClick,
}: {
  label: string;
  variant?: ButtonProps["variant"];
  className?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const { isOpen } = useAdmissions();

  if (!isOpen) {
    return (
      <Button
        disabled
        variant="secondary"
        size={size}
        className={cn(
          "bg-slate-800/90 text-slate-400 border border-slate-700/60 pointer-events-none cursor-not-allowed shadow-none font-semibold",
          className,
          "shadow-none hover:scale-100"
        )}
        aria-disabled="true"
      >
        {label === "Apply" ? "Admissions Closed" : "ปิดรับสมัคร"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
