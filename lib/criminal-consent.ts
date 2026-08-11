/**
 * The criminal-background-check consent an applicant gives on the application
 * form, in place of the "ผลตรวจประวัติอาชญากรรม" document they used to upload.
 *
 * The wording is pinned here rather than in lib/i18n/translations.ts because it
 * is PDPA evidence, not copy: the Thai text is what the applicant agreed to and
 * is rendered verbatim whatever language the site is set to, with the English
 * line shown alongside as an unofficial reading aid only.
 *
 * CRIMINAL_CONSENT_VERSION is stored on every application that consents, so a
 * later rewording can never be read back onto an applicant who agreed to the
 * older text. Bump it whenever any `th` string below changes.
 */
export const CRIMINAL_CONSENT_VERSION = "2026-08-v1";

export const CRIMINAL_CONSENT_ITEMS = [
  {
    field: "criminalConsentDeclaration",
    th: "ข้าพเจ้าขอรับรองว่า ข้าพเจ้าเป็นผู้มีคุณสมบัติเหมาะสม ไม่เคยเป็นผู้ต้องคำพิพากษาถึงที่สุดให้จำคุก หรือมีประวัติกระทำความผิดในคดีอาญาใดๆ ที่ส่งผลกระทบต่อคุณสมบัติ",
    en: "I certify that I am duly qualified, have never been subject to a final judgment of imprisonment, and hold no criminal record affecting my eligibility.",
  },
  {
    field: "criminalConsentBackgroundCheck",
    th: "ข้าพเจ้ายินยอมให้บริษัทฯ เก็บรวบรวม รวมถึงยินยอมให้บริษัทฯ ดำเนินการตรวจสอบประวัติอาชญากรรม (Criminal Background Check) กับสำนักงานตำรวจแห่งชาติ หรือหน่วยงานที่เกี่ยวข้องเพื่อวัตถุประสงค์ในการประเมินความเหมาะสมในการเข้าทำงาน",
    en: "I consent to the Company collecting my personal data and conducting a Criminal Background Check with the Royal Thai Police or other relevant authorities, for the purpose of assessing my suitability for employment.",
  },
  {
    field: "criminalConsentRevocation",
    th: "หากตรวจพบในภายหลังว่าข้อมูลหรือคำรับรองดังกล่าวไม่เป็นความจริง ข้าพเจ้ายินยอมให้บริษัทฯ ยกเลิกสิทธิ์ในการสมัคร หรือยกเลิกการจ้างงาน/สัญญาฝึกอบรมได้ทันทีโดยไม่มีเงื่อนไข",
    en: "Should any of the above information or certification later be found untrue, I consent to the Company immediately and unconditionally revoking my application, or terminating my employment / training contract.",
  },
] as const;

export type CriminalConsentField = (typeof CRIMINAL_CONSENT_ITEMS)[number]["field"];

export const CRIMINAL_CONSENT_FIELDS: CriminalConsentField[] = CRIMINAL_CONSENT_ITEMS.map(
  (item) => item.field
);

/** Shape carrying the three ticks, in any of the forms they travel in. */
export interface CriminalConsentTicks {
  criminalConsentDeclaration?: boolean | null;
  criminalConsentBackgroundCheck?: boolean | null;
  criminalConsentRevocation?: boolean | null;
}

/** True only when the applicant accepted all three clauses. */
export function hasFullCriminalConsent(value: CriminalConsentTicks | null | undefined): boolean {
  if (!value) return false;
  return CRIMINAL_CONSENT_FIELDS.every((field) => value[field] === true);
}
