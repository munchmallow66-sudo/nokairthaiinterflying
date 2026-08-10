/**
 * Re-sends the confirmation email carrying an application's *current* tracking
 * password.
 *
 * Needed after scripts/backfill-application-passwords.ts is run without
 * --email: the backfill replaces an unrecoverable NULL password with a fresh
 * one, so the applicant is left holding the password from their original
 * confirmation mail while the DB — and therefore the admin panel and
 * /api/track — has a different value. Until the new one reaches them, they
 * cannot open their own status page.
 *
 * Unlike the backfill this never writes: it only reads what is already stored
 * and mails it, so it is safe to run against any application at any time.
 *
 * Usage:
 *   npm run resend:password -- TIF-2026-4809                     # dry run
 *   npm run resend:password -- TIF-2026-4809 --send              # actually send
 *   npm run resend:password -- TIF-2026-4809 TIF-2026-3786 --send
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

const SEND = process.argv.includes("--send");
const appNumbers = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check .env / .env.local");
  }
  if (appNumbers.length === 0) {
    throw new Error(
      "No application numbers given.\n" +
        "  Usage: npm run resend:password -- TIF-2026-4809 [TIF-2026-3786 ...] [--send]"
    );
  }

  const prisma = new PrismaClient();

  try {
    const apps = await prisma.application.findMany({
      where: {
        OR: appNumbers.map((num) => ({
          applicationNumber: { equals: num, mode: "insensitive" as const },
        })),
      },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: "asc" },
    });

    const found = new Set(apps.map((a) => a.applicationNumber.toUpperCase()));
    for (const num of appNumbers) {
      if (!found.has(num.toUpperCase())) {
        console.warn(`! ${num} — no such application, skipped`);
      }
    }

    if (apps.length === 0) {
      console.log("Nothing to send.");
      return;
    }

    console.log(`${apps.length} application(s)${SEND ? "" : " (dry run — no mail sent)"}:\n`);

    let mailed = 0;

    for (const app of apps) {
      const student = app.student;
      const name = student
        ? `${student.title || ""} ${student.firstNameTh || student.firstNameEn || ""} ${
            student.lastNameTh || student.lastNameEn || ""
          }`.trim()
        : "(no student record)";
      const email = student?.user?.email || "";
      const password = (app.password || "").trim();

      console.log(
        `  ${app.applicationNumber.padEnd(16)} ${(password || "(NONE)").padEnd(10)} ${name}  <${
          email || "no email"
        }>`
      );

      // A blank password means the row was never backfilled. Mailing an empty
      // credential is worse than mailing nothing — run the backfill first.
      if (!password) {
        console.warn(`    ! no password stored — run npm run backfill:passwords -- --apply --email`);
        continue;
      }
      if (!email) {
        console.warn(`    ! no email address on file — deliver ${password} manually`);
        continue;
      }
      if (!SEND) continue;

      const { sendApplicationConfirmationEmail } = await import("../lib/email");
      const result = await sendApplicationConfirmationEmail({
        toEmail: email,
        studentName: name,
        applicationNumber: app.applicationNumber,
        password,
      });
      if (result.success) {
        mailed++;
      } else {
        console.warn(`    ! email to ${email} failed: ${result.error}`);
      }
    }

    console.log("");
    if (SEND) {
      console.log(`Emailed ${mailed} of ${apps.length} application(s).`);
    } else {
      console.log("Dry run only. Re-run with --send to deliver these passwords.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
