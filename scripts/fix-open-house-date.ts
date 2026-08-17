/**
 * Rewrites the Open House date from 12 to 19 September in records written
 * before the event moved.
 *
 * The date an applicant sees under "หมายเหตุเจ้าหน้าที่" is not rendered from
 * the i18n table — it was baked into `applications.remarks` as a plain string
 * when they submitted their slip (see /api/payments and the track page's
 * approval handler). Changing the translation therefore fixes the date for
 * everyone who registers from now on and for nobody who already has.
 *
 * Two guards keep this from turning into a blind find-and-replace on live data:
 *
 *   1. `remarks` is pipe-separated, and only the segments that actually mention
 *      "Open House" are touched. A row whose remarks happen to carry another
 *      12 September — an interview slot, a staff instruction — keeps it. The
 *      written exam (26 ก.ย.) and the application deadline (17 ก.ย.) never match
 *      in the first place, since every pattern here is anchored on the day.
 *
 *   2. Every row's before/after is written to a timestamped JSON file next to
 *      this script before anything is updated, so a bad run can be reversed.
 *
 * Audit tables (activity_logs, audit_logs) are deliberately left alone: they
 * record what was said at the time, and a record that changes retroactively is
 * not a record. They are counted in the report so you can see the scale.
 *
 * Usage:
 *   npm run fix:open-house-date                # dry run — shows every change
 *   npm run fix:open-house-date -- --apply     # write, after saving a backup
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

/**
 * Every spelling of the old date the app has ever written, in both locales and
 * in both the Buddhist and Gregorian year the codebase mixes.
 */
const DATE_PATTERNS: [RegExp, string][] = [
  [/12\s*กันยายน\s*2569/g, "19 กันยายน 2569"],
  [/12\s*กันยายน\s*2026/g, "19 กันยายน 2026"],
  [/12\s*ก\.ย\.\s*2569/g, "19 ก.ย. 2569"],
  [/12\s*ก\.ย\.\s*2026/g, "19 ก.ย. 2026"],
  [/12\s*September\s*2026/g, "19 September 2026"],
  [/September\s*12,\s*2026/g, "September 19, 2026"],
  [/12\s*Sep\s*2026/g, "19 Sep 2026"],
  // The admin badge form, which has no year at all.
  [/12\s*ก\.ย\.(?!\s*\d)/g, "19 ก.ย."],
];

/**
 * Rewrites the date only inside the pipe-separated segments that are about the
 * Open House. Returns null when the text needs no change, so callers can tell
 * "already correct" from "rewritten to the same value".
 */
export function rewriteOpenHouseDate(text: string | null): string | null {
  if (!text) return null;

  const segments = text.split("|");
  let changed = false;

  const rewritten = segments.map((segment) => {
    if (!/open\s*house/i.test(segment)) return segment;

    let next = segment;
    for (const [pattern, replacement] of DATE_PATTERNS) {
      next = next.replace(pattern, replacement);
    }

    if (next !== segment) changed = true;
    return next;
  });

  // split("|")/join("|") is lossless — the surrounding spaces live inside the
  // segments, so untouched remarks come back byte-identical.
  return changed ? rewritten.join("|") : null;
}

type Change = {
  table: string;
  id: string;
  label: string;
  column: string;
  before: string;
  after: string;
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check .env / .env.local");
  }

  const prisma = new PrismaClient();

  try {
    const changes: Change[] = [];

    // --- applications.remarks: what the applicant reads on the track page ---
    const apps = await prisma.application.findMany({
      where: { remarks: { not: null } },
      select: { id: true, applicationNumber: true, remarks: true },
      orderBy: { createdAt: "asc" },
    });

    for (const app of apps) {
      const after = rewriteOpenHouseDate(app.remarks);
      if (after === null) continue;
      changes.push({
        table: "applications",
        id: app.id,
        label: app.applicationNumber,
        column: "remarks",
        before: app.remarks!,
        after,
      });
    }

    // --- admin_notes.content: staff-facing, but shown in the admin panel ---
    const notes = await prisma.adminNote.findMany({
      select: { id: true, content: true, applicationId: true },
      orderBy: { createdAt: "asc" },
    });

    for (const note of notes) {
      const after = rewriteOpenHouseDate(note.content);
      if (after === null) continue;
      changes.push({
        table: "admin_notes",
        id: note.id,
        label: note.applicationId,
        column: "content",
        before: note.content,
        after,
      });
    }

    // --- notifications.message: already delivered, but still displayed ---
    const notifications = await prisma.notification.findMany({
      select: { id: true, message: true, title: true },
      orderBy: { createdAt: "asc" },
    });

    for (const n of notifications) {
      const after = rewriteOpenHouseDate(n.message);
      if (after === null) continue;
      changes.push({
        table: "notifications",
        id: n.id,
        label: n.title,
        column: "message",
        before: n.message,
        after,
      });
    }

    // --- activity_logs: reported only, never rewritten (see header) ---
    const logs = await prisma.activityLog.findMany({
      select: { id: true, details: true },
    });
    const staleLogs = logs.filter((l) => rewriteOpenHouseDate(l.details) !== null).length;

    if (changes.length === 0) {
      console.log("Nothing to fix: no record carries the old Open House date.");
      if (staleLogs > 0) {
        console.log(`(${staleLogs} activity log(s) mention it — left as historical record.)`);
      }
      return;
    }

    console.log(
      `${changes.length} record(s) carry the old Open House date` +
        `${APPLY ? "" : " (dry run — nothing written)"}:\n`
    );

    for (const c of changes) {
      console.log(`  [${c.table}] ${c.label}`);
      console.log(`      - ${c.before}`);
      console.log(`      + ${c.after}`);
    }

    const byTable = changes.reduce<Record<string, number>>((acc, c) => {
      acc[c.table] = (acc[c.table] || 0) + 1;
      return acc;
    }, {});
    console.log(
      `\nBy table: ${Object.entries(byTable)
        .map(([t, n]) => `${t}=${n}`)
        .join(", ")}`
    );

    if (staleLogs > 0) {
      console.log(`activity_logs: ${staleLogs} mention(s) left untouched (historical record).`);
    }

    if (!APPLY) {
      console.log("\nDry run. Re-run with --apply to write these changes.");
      return;
    }

    // Backup before the first write, not after — a run that dies halfway must
    // still leave enough on disk to put every row back.
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.resolve(__dirname, `open-house-date-backup-${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(changes, null, 2), "utf8");
    console.log(`\nBackup written: ${backupPath}`);

    let written = 0;
    for (const c of changes) {
      switch (c.table) {
        case "applications":
          await prisma.application.update({ where: { id: c.id }, data: { remarks: c.after } });
          break;
        case "admin_notes":
          await prisma.adminNote.update({ where: { id: c.id }, data: { content: c.after } });
          break;
        case "notifications":
          await prisma.notification.update({ where: { id: c.id }, data: { message: c.after } });
          break;
      }
      written++;
    }

    console.log(`Updated ${written} record(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

// Guarded so the module can be imported (to reuse rewriteOpenHouseDate) without
// opening a database connection as a side effect.
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
