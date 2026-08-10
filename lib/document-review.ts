/**
 * Rules for the applicant-facing document resubmission flow, shared by the
 * track page and POST /api/track/documents so the client never offers an
 * upload the server will reject (and vice versa).
 */

/** The document set every applicant must have on file to pass Step 3 review. */
export const BASE_REQUIRED_DOC_TYPES = [
  "PHOTO_1_INCH",
  "NATIONAL_ID_CERTIFIED",
  "TRANSCRIPT_CERTIFIED",
  "HOUSE_REGISTRATION_CERTIFIED",
  "TOEIC",
  "CRIMINAL_RECORD_CHECK",
] as const;

/**
 * Extra slots offered on top of the required set. The military exemption is
 * required of male applicants by the application form, but gender data is not
 * always reliable on older records — if they already filed one it is picked up
 * as required by getResubmitDocTypes() instead.
 */
export const OPTIONAL_RESUBMIT_DOC_TYPES = ["MILITARY_SERVICE_EXEMPTION", "OTHER"];

/**
 * Evidence filed for other steps, not part of the Step 3 application document
 * set: the payment slip (Step 5) and the Class 1 medical certificate (Step 12).
 * A full resubmission replaces the applicant's application documents, and these
 * must survive it — an applicant who has already paid would otherwise lose the
 * proof of it — and are never demanded as part of the new set.
 */
export const PRESERVED_DOC_TYPES = new Set([
  "APPLICATION_FEE_SLIP",
  "MEDICAL_CERTIFICATE_CLASS_1",
  "MEDICAL_CERTIFICATE",
]);

/** DocumentType values an applicant is allowed to upload for themselves. */
export const UPLOADABLE_DOC_TYPES = new Set([
  "PHOTO_1_INCH",
  "PHOTO_2_INCH",
  "NATIONAL_ID_CERTIFIED",
  "NATIONAL_ID",
  "TRANSCRIPT_CERTIFIED",
  "TRANSCRIPT",
  "HOUSE_REGISTRATION_CERTIFIED",
  "HOUSE_REGISTRATION",
  "MEDICAL_CERTIFICATE_CLASS_1",
  "MEDICAL_CERTIFICATE",
  "CRIMINAL_RECORD_CHECK",
  "PASSPORT_PHOTO",
  "PASSPORT",
  "GRADUATION_CERTIFICATE",
  "TOEIC",
  "MILITARY_SERVICE_EXEMPTION",
  "OTHER",
]);

/**
 * Legacy and duplicate spellings of the same document. Without this an
 * applicant carrying a legacy `NATIONAL_ID` row would be asked for both it and
 * `NATIONAL_ID_CERTIFIED` — the same ID card, twice.
 */
const DOC_TYPE_ALIASES: Record<string, string> = {
  NATIONAL_ID: "NATIONAL_ID_CERTIFIED",
  TRANSCRIPT: "TRANSCRIPT_CERTIFIED",
  HOUSE_REGISTRATION: "HOUSE_REGISTRATION_CERTIFIED",
  PHOTO_2_INCH: "PHOTO_1_INCH",
  PASSPORT_PHOTO: "PHOTO_1_INCH",
  MEDICAL_CERTIFICATE: "MEDICAL_CERTIFICATE_CLASS_1",
};

export function canonicalDocType(type: string): string {
  return DOC_TYPE_ALIASES[type] || type;
}

/** Every stored spelling that a new document of `type` supersedes. */
export function docTypeFamily(type: string): string[] {
  const canonical = canonicalDocType(type);
  const family = new Set<string>([type, canonical]);
  Object.entries(DOC_TYPE_ALIASES).forEach(([alias, target]) => {
    if (target === canonical) family.add(alias);
  });
  return Array.from(family);
}

/**
 * The document types a full resubmission must contain: the standard required
 * set, plus anything else this applicant had already filed. "Upload everything
 * again" means everything they had, not a smaller set than before.
 */
export function getResubmitDocTypes(
  existingDocs: { type: string }[] | undefined | null
): { required: string[]; optional: string[] } {
  const existing = (existingDocs || [])
    .map((d) => canonicalDocType(d.type))
    .filter((t) => !PRESERVED_DOC_TYPES.has(t) && t !== "OTHER" && UPLOADABLE_DOC_TYPES.has(t));

  const required = Array.from(new Set<string>([...BASE_REQUIRED_DOC_TYPES, ...existing]));
  const optional = OPTIONAL_RESUBMIT_DOC_TYPES.filter((t) => !required.includes(t));

  return { required, optional };
}

/**
 * A REJECTED application is not necessarily a failed document review — the same
 * status carries written-exam and interview outcomes, which are final and must
 * never invite an upload. They are told apart by the wording staff sent, the
 * same test the track page uses to pick which message to render.
 */
export function isSelectionRejection(
  status: string,
  remarks: string | null | undefined,
  hasRejectedDocs: boolean
): boolean {
  if (status !== "REJECTED" || hasRejectedDocs) return false;
  return (
    !!remarks &&
    (remarks.includes("ขอบพระคุณ") ||
      remarks.includes("กำลังใจ") ||
      remarks.includes("เกณฑ์") ||
      remarks.includes("สัมภาษณ์") ||
      remarks.includes("สอบ"))
  );
}

/** True when staff have failed this applicant's document review. */
export function isDocumentReviewFailed(app: {
  status: string;
  remarks?: string | null;
  documents?: { isRejected?: boolean }[] | null;
}): boolean {
  const hasRejectedDocs = (app.documents || []).some((d) => !!d.isRejected);
  if (hasRejectedDocs) return true;
  if (app.status === "WAITING_DOCUMENTS") return true;
  return app.status === "REJECTED" && !isSelectionRejection(app.status, app.remarks, false);
}

/** Statuses where the applicant's document set is still open for edits. */
const DOC_STAGE_STATUSES = new Set([
  "ONLINE_REGISTRATION",
  "DRAFT",
  "SUBMITTED",
  "DOCS_UNDER_REVIEW",
  "WAITING_DOCUMENTS",
]);

/** Statuses where the Class 1 medical certificate is the document being asked for. */
const MEDICAL_STAGE_STATUSES = new Set(["INTERVIEW_PASSED", "MEDICAL_CHECK_CLASS_1"]);

/**
 * Whether a single replacement file of `type` may be accepted. Documents are
 * editable while review is still open or has failed; once review has passed,
 * only the Class 1 medical certificate the later steps ask for is accepted.
 */
export function canReplaceSingleDoc(
  app: { status: string; remarks?: string | null; documents?: { isRejected?: boolean }[] | null },
  type: string
): boolean {
  if (DOC_STAGE_STATUSES.has(app.status)) return true;
  if (isDocumentReviewFailed(app)) return true;
  return (
    MEDICAL_STAGE_STATUSES.has(app.status) &&
    canonicalDocType(type) === "MEDICAL_CERTIFICATE_CLASS_1"
  );
}
