import { z } from "zod";

export const step1Schema = z.object({
  title: z.string().min(1, "Title is required"),
  firstNameTh: z.string().min(2, "First Name (TH) is required"),
  lastNameTh: z.string().min(2, "Last Name (TH) is required"),
  firstNameEn: z.string().min(2, "First Name (EN) is required"),
  lastNameEn: z.string().min(2, "Last Name (EN) is required"),
  nickname: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  birthday: z.string().min(1, "Birthday is required"),
  age: z.coerce.number().min(15, "Age must be at least 15"),
  nationality: z.string().min(1, "Nationality is required"),
  religion: z.string().optional(),
  nationalId: z.string().length(13, "National ID must be 13 digits").or(z.string().length(0)).optional(),
  passport: z.string().optional(),
  phone: z.string().min(9, "Phone number must be at least 9 digits"),
  email: z.string().email("Invalid email address"),
  lineId: z.string().optional(),
  facebook: z.string().optional(),
});

export const step2Schema = z.object({
  currentAddress: z.string().min(5, "Address is required"),
  province: z.string().min(2, "Province is required"),
  district: z.string().min(2, "District is required"),
  subdistrict: z.string().min(2, "Subdistrict is required"),
  postalCode: z.string().length(5, "Postal code must be 5 digits"),
});

export const step3Schema = z.object({
  school: z.string().min(2, "High School/Institution name is required"),
  university: z.string().optional(),
  degree: z.string().min(2, "Highest degree is required"),
  gpax: z.coerce.number().min(0.0).max(4.0, "GPAX must be between 0.00 and 4.00"),
  graduationYear: z.coerce.number().min(1970).max(2030, "Invalid graduation year"),
});

export const step4Schema = z.object({
  emergencyName: z.string().min(2, "Contact name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  emergencyPhone: z.string().min(9, "Phone number is required"),
  emergencyAddress: z.string().min(5, "Address is required"),
});

export const step5Schema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  parentOccupation: z.string().optional(),
  parentPhone: z.string().optional(),
  parentAddress: z.string().optional(),
});

export const step6Schema = z.object({
  height: z.coerce.number().min(100, "Height in cm required"),
  weight: z.coerce.number().min(30, "Weight in kg required"),
  bloodType: z.string().min(1, "Blood type is required"),
  medicalConditions: z.string().optional(),
  allergy: z.string().optional(),
  medication: z.string().optional(),
});

export const step7Schema = z.object({
  toeicScore: z.coerce.number().min(0).max(990).optional(),
  ieltsScore: z.coerce.number().min(0).max(9.0).optional(),
  icaoLevel: z.coerce.number().min(1).max(6).optional(),
  otherCertificates: z.string().optional(),
});

export const step8Schema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  years: z.coerce.number().min(0).optional(),
});

export const step9Schema = z.object({
  documents: z.array(
    z.object({
      type: z.string(),
      secureUrl: z.string().url("Invalid file URL"),
      publicId: z.string(),
      originalName: z.string(),
    })
  ).min(1, "At least 1 document must be uploaded"),
});

export const fullApplicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema);

export type FullApplicationInput = z.infer<typeof fullApplicationSchema>;
