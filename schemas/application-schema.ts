import { z } from "zod";

export const step1Schema = z.object({
  title: z.string().min(1, "Title is required"),
  firstNameTh: z
    .string()
    .min(1, "กรุณากรอกชื่อภาษาไทย")
    .regex(/^[ก-๙\s-]+$/, "กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น (Thai characters only)"),
  lastNameTh: z
    .string()
    .min(1, "กรุณากรอกนามสกุลภาษาไทย")
    .regex(/^[ก-๙\s-]+$/, "กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น (Thai characters only)"),
  firstNameEn: z
    .string()
    .min(1, "First Name (EN) is required")
    .regex(/^[a-zA-Z\s-]+$/, "กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น (English characters only)"),
  lastNameEn: z
    .string()
    .min(1, "Last Name (EN) is required")
    .regex(/^[a-zA-Z\s-]+$/, "กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น (English characters only)"),
  nickname: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  birthday: z.string().min(1, "Birthday is required"),
  age: z.coerce.number().min(1, "Age is required"),
  nationality: z.string().min(1, "Nationality is required"),
  religion: z.string().optional(),
  nationalId: z
    .string({ required_error: "กรุณากรอกเลขบัตรประจำตัวประชาชน" })
    .min(1, "กรุณากรอกเลขบัตรประจำตัวประชาชน")
    .regex(/^\d{13}$/, "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น (13 Digits Only)"),
  passport: z.string().optional(),
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์")
    .regex(/^\d{9,10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลักเท่านั้น"),
  email: z.string().email("Invalid email address"),
  lineId: z.string().optional(),
  facebook: z.string().optional(),
});

export const step2Schema = z.object({
  currentAddress: z.string().min(1, "Address is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  subdistrict: z.string().min(1, "Subdistrict is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export const step3Schema = z.object({
  school: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().min(1, "Highest degree is required"),
  gpax: z.coerce.number().min(0.0).max(4.0, "GPAX must be between 0.00 and 4.00"),
  graduationYear: z.coerce.number().min(1970).max(2030, "Invalid graduation year"),
});

export const step4Schema = z.object({
  emergencyName: z.string().min(1, "Contact name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  emergencyPhone: z.string().min(8, "Phone number is required"),
  emergencyAddress: z.string().min(1, "Address is required"),
});

export const step5Schema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  parentOccupation: z.string().optional(),
  parentPhone: z.string().optional(),
  parentAddress: z.string().optional(),
});

export const step6Schema = z.object({
  height: z.coerce.number().min(50, "Height required"),
  weight: z.coerce.number().min(20, "Weight required"),
  bloodType: z.string().min(1, "Blood type is required"),
  medicalConditions: z.string().optional(),
  allergy: z.string().optional(),
  medication: z.string().optional(),
});

export const step7Schema = z.object({
  toeicScore: z.coerce.number().optional().nullable(),
  ieltsScore: z.coerce.number().optional().nullable(),
  icaoLevel: z.coerce.number().optional().nullable(),
  otherCertificates: z.string().optional(),
});

export const step8Schema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  years: z.coerce.number().optional().nullable(),
});

export const step9Schema = z.object({
  documents: z.array(
    z.object({
      type: z.string(),
      secureUrl: z.string(),
      publicId: z.string(),
      originalName: z.string(),
    })
  ),
});

/**
 * Criminal-background-check consent. All three clauses are mandatory on a
 * public submission — they are what replaced the police report applicants used
 * to attach, so a submission without them carries no evidence at all.
 * `required_error` covers a payload that omits the key entirely; the refine
 * covers an explicit `false`, and both report the same thing.
 */
const CONSENT_INCOMPLETE_MESSAGE =
  "กรุณาติ๊กยินยอมเงื่อนไขการตรวจสอบประวัติอาชญากรรมให้ครบทั้ง 3 ข้อก่อนส่งใบสมัคร";

const consentTick = () =>
  z
    .boolean({
      required_error: CONSENT_INCOMPLETE_MESSAGE,
      invalid_type_error: CONSENT_INCOMPLETE_MESSAGE,
    })
    .refine((v) => v === true, { message: CONSENT_INCOMPLETE_MESSAGE });

export const step10Schema = z.object({
  criminalConsentDeclaration: consentTick(),
  criminalConsentBackgroundCheck: consentTick(),
  criminalConsentRevocation: consentTick(),
});

export const fullApplicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema)
  .merge(step10Schema)
  .refine(
    (data) => {
      const types = new Set((data.documents || []).map((d) => d.type));
      const isMale = data.gender?.toLowerCase() === "male" || data.gender === "ชาย";
      // CRIMINAL_RECORD_CHECK is deliberately absent: the police report was
      // replaced by the step10Schema consent ticks.
      const hasBase =
        types.has("PHOTO_1_INCH") &&
        types.has("NATIONAL_ID_CERTIFIED") &&
        types.has("TRANSCRIPT_CERTIFIED") &&
        types.has("HOUSE_REGISTRATION_CERTIFIED");
      if (isMale) {
        return hasBase && types.has("MILITARY_SERVICE_EXEMPTION");
      }
      return hasBase;
    },
    {
      message: "กรุณาอัปโหลดเอกสารประกอบการสมัครให้ครบถ้วนตามที่กำหนด",
      path: ["documents"],
    }
  );

export type FullApplicationInput = z.infer<typeof fullApplicationSchema>;

/**
 * Text the officer may leave blank, collapsed to a placeholder. Several columns
 * behind these fields are NOT NULL in Postgres (Address, Education.school/degree,
 * EmergencyContact, MedicalInfo.bloodType), so they need *something* — "-" reads
 * as "not supplied yet" where invented data like "Bangkok" would silently become
 * a fact nobody entered.
 */
const staffText = (fallback = "-") =>
  z
    .string()
    .optional()
    .nullable()
    .transform((v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : fallback));

/** Same idea for the NOT NULL numeric columns (Education.gpax/graduationYear, MedicalInfo.height/weight). */
const staffNumber = (fallback: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return fallback;
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    });

/** Nullable score columns: blank stays blank rather than becoming a zero score. */
const staffOptionalNumber = () =>
  z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    });

/**
 * Applications keyed in by staff from the admin panel ("เพิ่มใบสมัคร").
 *
 * These are walk-ins and phone enquiries, not completed online submissions:
 * there is no uploaded document set and most of the form is blank, so
 * fullApplicationSchema — which demands six certified documents plus Thai/English
 * name spellings and a 13-digit national ID — would reject every one of them.
 *
 * The output shape is deliberately identical to fullApplicationSchema's so that
 * POST /api/applications runs one transaction for both paths. Anything the
 * officer skipped lands as a placeholder the admin can complete later from the
 * edit modal.
 */
export const adminCreateApplicationSchema = z.object({
  title: staffText(""),
  firstNameTh: staffText(),
  lastNameTh: staffText(),
  firstNameEn: z.string().min(1, "First Name (EN) is required"),
  lastNameEn: staffText(),
  nickname: staffText(""),
  gender: staffText(""),
  // Nullable in Prisma, and a real unknown: never stamp today's date onto it.
  birthday: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null)),
  age: staffOptionalNumber(),
  nationality: staffText("Thai"),
  religion: staffText(""),
  // Optional here, unlike the public form — staff often take a name and phone
  // number first. When supplied it must still be a real 13-digit ID, because
  // it is the duplicate-application guard.
  nationalId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null))
    .refine((v) => v === null || /^\d{13}$/.test(v), {
      message: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น (13 Digits Only)",
    }),
  passport: staffText(""),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  email: z.string().email("Invalid email address"),
  lineId: staffText(""),
  facebook: staffText(""),

  currentAddress: staffText(),
  province: staffText(),
  district: staffText(),
  subdistrict: staffText(),
  postalCode: staffText(),

  school: staffText(),
  university: staffText(""),
  degree: staffText(),
  gpax: staffNumber(0),
  graduationYear: staffNumber(new Date().getFullYear()),

  emergencyName: staffText(),
  relationship: staffText(),
  emergencyPhone: staffText(),
  emergencyAddress: staffText(),

  fatherName: staffText(""),
  motherName: staffText(""),
  parentOccupation: staffText(""),
  parentPhone: staffText(""),
  parentAddress: staffText(""),

  height: staffNumber(0),
  weight: staffNumber(0),
  bloodType: staffText(),
  medicalConditions: staffText(""),
  allergy: staffText(""),
  medication: staffText(""),

  toeicScore: staffOptionalNumber(),
  ieltsScore: staffOptionalNumber(),
  icaoLevel: staffOptionalNumber(),
  otherCertificates: staffText(""),

  company: staffText(""),
  position: staffText(""),
  years: staffOptionalNumber(),

  documents: z
    .array(
      z.object({
        type: z.string(),
        secureUrl: z.string(),
        publicId: z.string(),
        originalName: z.string(),
      })
    )
    .optional()
    .transform((v) => v || []),

  // A walk-in never passed through the consent form, so these stay false and
  // the admin panel reports "no consent on file" rather than claiming one.
  // Optional rather than required for the same reason the document set is.
  criminalConsentDeclaration: z.boolean().optional().transform((v) => v === true),
  criminalConsentBackgroundCheck: z.boolean().optional().transform((v) => v === true),
  criminalConsentRevocation: z.boolean().optional().transform((v) => v === true),
});

export type AdminCreateApplicationInput = z.infer<typeof adminCreateApplicationSchema>;
