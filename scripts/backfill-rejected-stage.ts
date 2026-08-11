/**
 * Backfill for REJECTED applications created before `rejectedStage` existed.
 *
 * Until it did, the applicant's page worked out which round had ended their
 * application by searching the staff message for words like "ข้อเขียน". A
 * rejection worded any other way was rendered as a failed document review —
 * step 3, "documents incomplete", with a working re-upload button in front of
 * someone who was already out of the running.
 *
 * Each row is classified from two pieces of evidence:
 *   1. the admin note the panel writes itself when a result is recorded
 *      ("ผลสอบข้อเขียน:", "ผลสอบสัมภาษณ์:", "[ไม่ผ่านการตรวจเอกสาร]"), which is
 *      the most recent one that matches — an applicant can be failed, reinstated
 *      and failed again in a different round;
 *   2. failing that, the same keywords the old display logic used.
 *
 * Rows that neither test can place are listed and left alone. Guessing one
 * would tell a real applicant they failed a round they never sat.
 *
 * Usage:
 *   npm run backfill:rejected-stage                # dry run — classification only
 *   npm run backfill:rejected-stage -- --apply     # write the column
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// ts-node runs this outside Next.js, so nothing has loaded .env yet. Existing
// process env always wins, so CI/CD-injected values are never overwritten.
function loadEnvFile(file: string) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  for (const rawLine of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

[".env.local", ".env"].forEach(loadEnvFile);

const APPLY = process.argv.includes("--apply");

type Stage = "DOCUMENT" | "WRITTEN_EXAM" | "INTERVIEW";

/** The result the admin panel recorded, from the note it wrote at the time. */
function stageFromAdminNotes(notes: { content: string }[]): Stage | null {
  for (const note of notes) {
    const c = note.content || "";
    if (c.includes("ผลสอบสัมภาษณ์")) return "INTERVIEW";
    if (c.includes("ผลสอบข้อเขียน")) return "WRITTEN_EXAM";
    if (c.includes("ไม่ผ่านการตรวจเอกสาร") || c.includes("แจ้งเอกสารผิด")) return "DOCUMENT";
  }
  return null;
}

/** The old display rule, applied one last time so its verdicts carry over. */
function stageFromRemarks(remarks: string | null): Stage | null {
  if (!remarks) return null;
  if (remarks.includes("สัมภาษณ์") || remarks.includes("Interview")) return "INTERVIEW";
  if (
    remarks.includes("ข้อเขียน") ||
    remarks.includes("Written Exam") ||
    remarks.includes("ขอบพระคุณ") ||
    remarks.includes("กำลังใจ") ||
    remarks.includes("เกณฑ์") ||
    remarks.includes("สอบ")
  ) {
    return "WRITTEN_EXAM";
  }
  return null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check .env / .env.local");
  }

  const prisma = new PrismaClient();

  try {
    const rows = await prisma.application.findMany({
      where: { status: "REJECTED", rejectedStage: null },
      include: {
        adminNotes: { orderBy: { createdAt: "desc" } },
        documents: { select: { isRejected: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (rows.length === 0) {
      console.log("Nothing to backfill: every REJECTED application already has a stage.");
      return;
    }

    console.log(
      `${rows.length} REJECTED application(s) without a stage${APPLY ? "" : " (dry run — nothing written)"}:\n`
    );

    const undecided: string[] = [];
    let written = 0;

    for (const app of rows) {
      const byNote = stageFromAdminNotes(app.adminNotes);
      const byRemarks = stageFromRemarks(app.remarks);
      // The admin note is the panel's own record of the action; the keyword
      // rule only reproduces what the applicant was already being shown.
      const stage = byNote || byRemarks;
      const source = byNote ? "admin note" : byRemarks ? "remarks keyword" : "-";

      if (!stage) {
        undecided.push(app.applicationNumber);
        console.log(`  ${app.applicationNumber.padEnd(18)} UNDECIDED — left as NULL`);
        console.log(`      remarks: ${JSON.stringify((app.remarks || "").slice(0, 120))}`);
        continue;
      }

      console.log(`  ${app.applicationNumber.padEnd(18)} ${stage.padEnd(13)} (from ${source})`);

      if (!APPLY) continue;

      await prisma.application.update({
        where: { id: app.id },
        data: { rejectedStage: stage },
      });
      written++;
    }

    console.log("");
    if (APPLY) {
      console.log(`Wrote ${written} row(s).`);
    } else {
      console.log("Dry run. Re-run with --apply to write these values.");
    }

    if (undecided.length > 0) {
      console.log(
        `\n${undecided.length} row(s) could not be placed and were left NULL — they render as a document` +
          ` review failure until someone sets the round by hand:\n  ${undecided.join("\n  ")}`
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
