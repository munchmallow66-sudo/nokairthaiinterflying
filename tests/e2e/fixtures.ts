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
 * MILITARY_SERVICE_EXEMPTION is skipped because fixtures use gender=Female. */
export const REQUIRED_DOC_TYPES = [
  "PHOTO_1_INCH",
  "NATIONAL_ID_CERTIFIED",
  "TRANSCRIPT_CERTIFIED",
  "HOUSE_REGISTRATION_CERTIFIED",
  "MEDICAL_CERTIFICATE_CLASS_1",
  "CRIMINAL_RECORD_CHECK",
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
 * dummy placeholder rows — the schema only checks doc *type* presence, not
 * that secureUrl points to a real uploaded file. */
export function applicationApiPayload(applicant: Applicant, applicationNumber: string) {
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
      { type: "PHOTO_1_INCH", secureUrl: "https://example.invalid/photo.jpg", publicId: "test_photo", originalName: "photo.jpg" },
      { type: "NATIONAL_ID_CERTIFIED", secureUrl: "https://example.invalid/id.jpg", publicId: "test_id", originalName: "id.jpg" },
      { type: "TRANSCRIPT_CERTIFIED", secureUrl: "https://example.invalid/transcript.jpg", publicId: "test_transcript", originalName: "transcript.jpg" },
      { type: "HOUSE_REGISTRATION_CERTIFIED", secureUrl: "https://example.invalid/house.jpg", publicId: "test_house", originalName: "house.jpg" },
      { type: "CRIMINAL_RECORD_CHECK", secureUrl: "https://example.invalid/criminal.jpg", publicId: "test_criminal", originalName: "criminal.jpg" },
    ],
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
  return request.post("/api/auth/admin-login", {
    data: { email: "admin@tif.ac.th", password: "!Admin_TIF@8649." },
  });
}
