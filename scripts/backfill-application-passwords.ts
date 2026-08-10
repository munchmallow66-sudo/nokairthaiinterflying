/**
 * Backfill for applications created before POST /api/applications persisted
 * the tracking password.
 *
 * Those rows carry password = NULL, which means:
 *   - the admin detail panel shows "-" instead of the applicant's password
 *   - /api/track fails closed, so the applicant can never open their own status
 *
 * The original password is unrecoverable (it only ever existed in the applicant's
 * confirmation email), so this issues a fresh one per application and, with
 * --email, re-sends the bilingual confirmation mail carrying it.
 *
 * Usage:
 *   npm run backfill:passwords                  # dry run — lists affected rows only
 *   npm run backfill:passwords -- --apply       # write new passwords to the DB
 *   npm run backfill:passwords -- --apply --email   # write + email each applicant
 *
 * Without --email, hand the printed passwords to the applicants yourself; they
 * have no other way to learn them.
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
const SEND_EMAIL = process.argv.includes("--email");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — check .env / .env.local");
  }

  // Imported lazily so the .env load above happens first.
  const { generateSecurePassword } = await import("../lib/utils");
  const prisma = new PrismaClient();

  try {
    const broken = await prisma.application.findMany({
      where: { OR: [{ password: null }, { password: "" }] },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: "asc" },
    });

    if (broken.length === 0) {
      console.log("Nothing to backfill: every application already has a tracking password.");
      return;
    }

    console.log(
      `${broken.length} application(s) without a tracking password${APPLY ? "" : " (dry run — nothing written)"}:\n`
    );

    let written = 0;
    let mailed = 0;

    for (const app of broken) {
      const student = app.student;
      const name = student
        ? `${student.title || ""} ${student.firstNameTh || student.firstNameEn || ""} ${
            student.lastNameTh || student.lastNameEn || ""
          }`.trim()
        : "(no student record)";
      const email = student?.user?.email || "";
      const newPassword = generateSecurePassword(6);

      console.log(
        `  ${app.applicationNumber.padEnd(16)} ${newPassword.padEnd(10)} ${name}  <${email || "no email"}>`
      );

      if (!APPLY) continue;

      await prisma.application.update({
        where: { id: app.id },
        data: { password: newPassword },
      });
      written++;

      if (SEND_EMAIL && email) {
        const { sendApplicationConfirmationEmail } = await import("../lib/email");
        const result = await sendApplicationConfirmationEmail({
          toEmail: email,
          studentName: name,
          applicationNumber: app.applicationNumber,
          password: newPassword,
        });
        if (result.success) {
          mailed++;
        } else {
          console.warn(`    ! email to ${email} failed: ${result.error}`);
        }
      } else if (SEND_EMAIL) {
        console.warn(`    ! no email address on file — deliver ${newPassword} manually`);
      }
    }

    console.log("");
    if (APPLY) {
      console.log(`Updated ${written} application(s).${SEND_EMAIL ? ` Emailed ${mailed}.` : ""}`);
      if (!SEND_EMAIL) {
        console.log("No emails were sent — pass --email, or deliver the passwords above yourself.");
      }
    } else {
      console.log("Dry run only. Re-run with --apply to write these passwords.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
