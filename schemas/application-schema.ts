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

export const fullApplicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema)
  .refine(
    (data) => {
      const types = new Set((data.documents || []).map((d) => d.type));
      const isMale = data.gender?.toLowerCase() === "male" || data.gender === "ชาย";
      const hasBase =
        types.has("PHOTO_1_INCH") &&
        types.has("NATIONAL_ID_CERTIFIED") &&
        types.has("TRANSCRIPT_CERTIFIED") &&
        types.has("HOUSE_REGISTRATION_CERTIFIED") &&
        types.has("CRIMINAL_RECORD_CHECK");
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
