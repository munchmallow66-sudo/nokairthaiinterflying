import { Button } from "@/components/ui/button";

/**
 * Whether admissions are currently open.
 *
 * Controlled by NEXT_PUBLIC_ADMISSIONS_OPEN (public, inlined into the client
 * bundle at build time). Defaults to false (closed). Set
 * NEXT_PUBLIC_ADMISSIONS_OPEN="true" to re-open applications.
 */
export function admissionsAreOpen(): boolean {
  return process.env.NEXT_PUBLIC_ADMISSIONS_OPEN === "true";
}

/**
 * Apply CTA used across public pages (navbar, footer, hero, courses, career,
 * admission). When admissions are closed it renders a disabled button that says
 * "ปิดรับสมัคร / Admissions Closed" instead of linking to /apply.
 */
export function ApplyCta({
  label,
  className = "",
  size = "md",
  onClick,
}: {
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const open = admissionsAreOpen();

  if (!open) {
    return (
      <Button disabled size={size} className={className} aria-disabled="true">
        {label === "Apply" ? "Admissions Closed" : "ปิดรับสมัคร"}
      </Button>
    );
  }

  return (
    <Button size={size} className={className} onClick={onClick}>
      {label}
    </Button>
  );
}
