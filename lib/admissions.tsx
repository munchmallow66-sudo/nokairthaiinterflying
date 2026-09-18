import { Button } from "@/components/ui/button";

/**
 * Whether admissions are currently open.
 *
 * Controlled by NEXT_PUBLIC_ADMISSIONS_OPEN (public, inlined into the client
 * bundle at build time because every consumer here is a client component).
 * Anything other than "false" means open, so the flag defaults to open when
 * unset — the same behaviour the site had before the flag existed.
 */
export function admissionsAreOpen(): boolean {
  return process.env.NEXT_PUBLIC_ADMISSIONS_OPEN !== "false";
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
