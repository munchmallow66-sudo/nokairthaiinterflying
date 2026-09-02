/**
 * Student.gender is a free-form `String?`, so nothing counting or reporting on
 * it can trust the raw value. The public form writes "Male"/"Female" from a
 * fixed dropdown (components/admission/multi-step-form.tsx), but the staff-keyed
 * path takes plain text and may leave it blank, and the application schema still
 * treats the Thai "ชาย" as male when deciding whether military-service papers
 * are required — so all three spellings reach the database.
 *
 * "unspecified" is deliberately its own bucket rather than being folded into
 * male. The applicant drawer renders a missing gender as "Male" for display
 * only; counting it that way would quietly inflate the male figure in the
 * dashboard and in exported reports.
 */
export type NormalizedGender = "male" | "female" | "unspecified";

export function normalizeGender(raw?: string | null): NormalizedGender {
  const value = raw?.trim().toLowerCase();
  if (!value) return "unspecified";
  if (value === "male" || value === "m" || value === "ชาย") return "male";
  if (value === "female" || value === "f" || value === "หญิง") return "female";
  return "unspecified";
}

/** Column value for exported reports: "-" matches the other blank fields there. */
export function genderExportLabel(raw?: string | null): "Male" | "Female" | "-" {
  const normalized = normalizeGender(raw);
  if (normalized === "male") return "Male";
  if (normalized === "female") return "Female";
  return "-";
}

export interface GenderCounts {
  male: number;
  female: number;
  unspecified: number;
  total: number;
}

/** Structural on purpose — callers pass applications, students, or plain rows. */
type HasGender = { student?: { gender?: string | null } | null };

export function countByGender(records: HasGender[]): GenderCounts {
  const counts: GenderCounts = { male: 0, female: 0, unspecified: 0, total: records.length };
  for (const record of records) {
    counts[normalizeGender(record.student?.gender)] += 1;
  }
  return counts;
}
