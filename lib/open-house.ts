/**
 * Whether an applicant is coming to the Open House.
 *
 * Application.joinOpenHouse is a nullable Boolean with three meaningful states:
 * true (coming), false (declined), and null (never asked — the choice is only
 * put to the applicant when they attach the 1,800 THB fee slip on /pay or
 * /track). Collapsing null into false would report someone who has not reached
 * the payment step as having declined.
 *
 * Records created before the column existed carry the answer only inside the
 * remarks text that the payment flow wrote, so the resolver falls back to
 * reading that. The fallback checks `== null` rather than `=== undefined`
 * because Prisma returns an unset column as null: keying on undefined alone
 * would skip every record that actually came from the database.
 *
 * Note that the fallback is best-effort. app/api/payments/route.ts only keeps
 * the Open House sentence in remarks while the application is still awaiting
 * the fee; later stages overwrite the column with exam results and staff
 * instructions, taking the sentence with them. Anything needing a guaranteed
 * answer must read joinOpenHouse.
 */
export type OpenHouseChoice = "joining" | "not-joining" | "unanswered";

/** Structural on purpose — callers pass full applications or trimmed rows. */
type OpenHouseSource = {
  joinOpenHouse?: boolean | null;
  remarks?: string | null;
  adminNotes?: ({ content?: string | null } | null)[] | null;
};

export function resolveOpenHouseChoice(app: OpenHouseSource): OpenHouseChoice {
  const choice = app.joinOpenHouse;
  const remarks = app.remarks || "";
  const noExplicitAnswer = choice == null;

  // "ไม่ประสงค์เข้าร่วมงาน Open House" contains "เข้าร่วมงาน Open House", so the
  // loosest joining phrase has to exclude the declining one explicitly.
  const readsAsJoining =
    choice === true ||
    (noExplicitAnswer &&
      (remarks.includes("ลงทะเบียนเข้าร่วมงาน Open House") ||
        remarks.includes("มีความประสงค์เข้าร่วม") ||
        (remarks.includes("เข้าร่วมงาน Open House") && !remarks.includes("ไม่ประสงค์"))));

  const readsAsDeclining =
    choice === false ||
    (noExplicitAnswer &&
      (remarks.includes("ไม่ประสงค์เข้าร่วม") ||
        remarks.includes("ไม่เข้าร่วม") ||
        (app.adminNotes || []).some((note) => note?.content?.includes("ไม่ประสงค์เข้าร่วม"))));

  if (readsAsJoining) return "joining";
  if (readsAsDeclining) return "not-joining";
  return "unanswered";
}

/**
 * Column value for exported reports. "Not answered" is spelled out rather than
 * left as the "-" the blank columns use: it is an actual state staff act on
 * (chase the applicant), not missing data.
 */
export function openHouseExportLabel(app: OpenHouseSource): "Yes" | "No" | "Not answered" {
  const choice = resolveOpenHouseChoice(app);
  if (choice === "joining") return "Yes";
  if (choice === "not-joining") return "No";
  return "Not answered";
}

export interface OpenHouseCounts {
  joining: number;
  notJoining: number;
  unanswered: number;
  total: number;
}

export function countOpenHouse(apps: OpenHouseSource[]): OpenHouseCounts {
  const counts: OpenHouseCounts = { joining: 0, notJoining: 0, unanswered: 0, total: apps.length };
  for (const app of apps) {
    const choice = resolveOpenHouseChoice(app);
    if (choice === "joining") counts.joining += 1;
    else if (choice === "not-joining") counts.notJoining += 1;
    else counts.unanswered += 1;
  }
  return counts;
}
