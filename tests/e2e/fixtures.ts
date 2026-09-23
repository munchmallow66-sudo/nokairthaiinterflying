import { test as base, expect, type APIRequestContext } from "@playwright/test";

/**
 * Every test in this suite runs against the real dev server: real Neon
 * Postgres DB, real Cloudinary uploads, and real Office365 SMTP email sends
 * (see playwright.config.ts). Force English UI copy via localStorage so
 * selectors/assertions don't depend on the Thai/English toggle default.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tif_language", "en");
      // Never resume a stale draft from a previous local run.
      window.localStorage.removeItem("tif_cadet_application_draft");
    });
    await use(page);
  },
});

export { expect };

const RUN_ID = Date.now(); // ~13 digits today -> also reused as a synthetic Thai national ID

/** A fresh, valid applicant fixture. Every field is unique per run so the
 * server's national-ID duplicate check never collides across test runs. */
export function makeApplicant(seed = 0) {
  const uniqueId = RUN_ID + seed; // stays 13 digits until year ~2286
  const phoneDigits = `08${String(uniqueId).slice(-8)}`; // 10 digits, matches ^\d{9,10}$

  return {
    nationalId: String(uniqueId),
    phone: phoneDigits,
    email: "watchara47114145@gmail.com",
    title: "Ms.",
    firstNameTh: "ทดสอบ",
    lastNameTh: "อัตโนมัติ",
    firstNameEn: "Playwright",
    lastNameEn: "Automation",
    nickname: "QA",
    gender: "Female",
    birthday: "2000-01-15",
    age: "26",
    nationality: "Thai",
    passport: "",
    currentAddress: "123 Sukhumvit Road",
    province: "Bangkok",
    district: "Watthana",
    subdistrict: "Khlong Toei Nuea",
    postalCode: "10110",
    university: "Kasetsart University",
    degree: "Bachelor of Engineering",
    gpax: "3.50",
    graduationYear: "2024",
    emergencyName: "Somsak Jaidee",
    relationship: "Father",
    emergencyPhone: phoneDigits,
    emergencyAddress: "123 Sukhumvit Road, Bangkok",
    height: "165",
    weight: "55",
    bloodType: "O",
  };
}

export type Applicant = ReturnType<typeof makeApplicant>;

/** Required document types the UI checklist enforces before Submit unlocks
 * (see REQUIRED_DOCS_CONFIG in components/admission/multi-step-form.tsx).
 * MILITARY_SERVICE_EXEMPTION is skipped because fixtures use gender=Female.
 * CRIMINAL_RECORD_CHECK is not here: the police report was replaced by the
 * three consent ticks on the form (see lib/criminal-consent.ts). */
export const REQUIRED_DOC_TYPES = [
  "PHOTO_1_INCH",
  "NATIONAL_ID_CERTIFIED",
  "TRANSCRIPT_CERTIFIED",
  "HOUSE_REGISTRATION_CERTIFIED",
  "TOEIC",
] as const;

// Smallest possible valid JPEG (1x1 red pixel) so /api/upload has real image
// bytes to hand to Cloudinary instead of an empty buffer.
const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMDAwMDAwMDAwMEBAMEBQgFBQUFCAoICAgICggKCgoKCgoKDA0MDA0MDA0NDQ4ODg4ODg4ODg4ODg4ODg4ODg7/2wBDAQQEBAUFBQgFBQgKCAgKChAKCgoKEBAODg4ODg4QDg4ODg4OEBAREREREBAREREREREREREREREREREREREREf/AABEIAAEAAQMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAX/9k=";

export function tinyJpegBuffer(): Buffer {
  return Buffer.from(TINY_JPEG_BASE64, "base64");
}

/** Builds the JSON body /api/applications expects, for tests that create a
 * fixture application directly via the API instead of driving the 8-step UI
 * form (that path is exercised end-to-end by apply.spec.ts). Documents are
 * placeholder Cloudinary URLs. UI upload behavior is covered separately. */
export function applicationApiPayload(applicant: Applicant, applicationNumber: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo";
  const uploaded = (publicId: string) =>
    `https://res.cloudinary.com/${cloudName}/image/upload/tif_cadet_test/${publicId}.jpg`;

  return {
    applicationNumber,
    title: applicant.title,
    firstNameTh: applicant.firstNameTh,
    lastNameTh: applicant.lastNameTh,
    firstNameEn: applicant.firstNameEn,
    lastNameEn: applicant.lastNameEn,
    nickname: applicant.nickname,
    gender: applicant.gender,
    birthday: applicant.birthday,
    age: Number(applicant.age),
    nationality: applicant.nationality,
    nationalId: applicant.nationalId,
    passport: applicant.passport,
    phone: applicant.phone,
    email: applicant.email,
    currentAddress: applicant.currentAddress,
    province: applicant.province,
    district: applicant.district,
    subdistrict: applicant.subdistrict,
    postalCode: applicant.postalCode,
    degree: applicant.degree,
    university: applicant.university,
    gpax: Number(applicant.gpax),
    graduationYear: Number(applicant.graduationYear),
    emergencyName: applicant.emergencyName,
    relationship: applicant.relationship,
    emergencyPhone: applicant.emergencyPhone,
    emergencyAddress: applicant.emergencyAddress,
    height: Number(applicant.height),
    weight: Number(applicant.weight),
    bloodType: applicant.bloodType,
    documents: [
      { type: "PHOTO_1_INCH", secureUrl: uploaded("test_photo"), publicId: "test_photo", originalName: "photo.jpg" },
      { type: "NATIONAL_ID_CERTIFIED", secureUrl: uploaded("test_id"), publicId: "test_id", originalName: "id.jpg" },
      { type: "TRANSCRIPT_CERTIFIED", secureUrl: uploaded("test_transcript"), publicId: "test_transcript", originalName: "transcript.jpg" },
      { type: "HOUSE_REGISTRATION_CERTIFIED", secureUrl: uploaded("test_house"), publicId: "test_house", originalName: "house.jpg" },
      { type: "TOEIC", secureUrl: uploaded("test_toeic"), publicId: "test_toeic", originalName: "toeic.jpg" },
    ],
    // All three are mandatory — fullApplicationSchema rejects the submission
    // without them, so a fixture that omits any never reaches the database.
    criminalConsentDeclaration: true,
    criminalConsentBackgroundCheck: true,
    criminalConsentRevocation: true,
  };
}

export function generateApplicationNumber(seed = 0) {
  const year = new Date().getFullYear();
  // Last 4 digits of the run timestamp + seed, kept unique across a single test run.
  const suffix = (RUN_ID + seed) % 10000;
  return `TIF-${year}-${String(suffix).padStart(4, "0")}`;
}

/** Cleans up a fixture application. Cascades in prisma/schema.prisma delete
 * the Student, Address, Education, Documents, Payments, etc. in one call —
 * see DELETE /api/applications in app/api/applications/route.ts. Retries
 * because the Neon serverless Postgres this points at can cold-start and
 * transiently refuse a connection ("Can't reach database server"); without
 * a retry a single blip leaves a real row behind in the shared database. */
export async function deleteApplication(request: APIRequestContext, applicationNumberOrId: string) {
  await adminLoginRequest(request);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await request.delete(`/api/applications?id=${encodeURIComponent(applicationNumberOrId)}`, {
      timeout: 30_000,
    });
    if (res.ok()) return;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 3000));
  }
  console.warn(`Cleanup warning: could not confirm deletion of ${applicationNumberOrId}`);
}

export async function adminLoginRequest(request: APIRequestContext) {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are required for admin E2E tests");
  }
  return request.post("/api/auth/admin-login", {
    data: { email, password },
  });
}
