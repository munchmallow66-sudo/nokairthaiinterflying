import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateApplicationNumber(): string {
  const prefix = "TIF";
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

const DOC_TYPE_MAP: Record<string, string> = {
  PHOTO_1_INCH: "Photo",
  PHOTO_2_INCH: "Photo2Inch",
  NATIONAL_ID_CERTIFIED: "NationalID",
  NATIONAL_ID: "NationalID",
  TRANSCRIPT_CERTIFIED: "Transcript",
  TRANSCRIPT: "Transcript",
  HOUSE_REGISTRATION_CERTIFIED: "HouseRegistration",
  HOUSE_REGISTRATION: "HouseRegistration",
  MEDICAL_CERTIFICATE_CLASS_1: "MedicalCert",
  MEDICAL_CERTIFICATE: "MedicalCert",
  CRIMINAL_RECORD_CHECK: "CriminalRecord",
  PASSPORT_PHOTO: "Passport",
  PASSPORT: "Passport",
  APPLICATION_FEE_SLIP: "PaymentSlip",
  GRADUATION_CERTIFICATE: "GraduationCert",
  TOEIC: "TOEIC",
  OTHER: "Document",
};

export function formatDocumentFileName(
  appNumber: string,
  title: string = "",
  firstName: string = "",
  docType: string = "OTHER",
  originalName: string = "file.pdf"
): string {
  const cleanOriginal = originalName || "file.pdf";
  const extMatch = cleanOriginal.match(/(\.[a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : ".pdf";

  const cleanTitle = (title || "").trim().replace(/\s+/g, "");
  const cleanFirstName = (firstName || "").trim().replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "");
  const typeLabel = DOC_TYPE_MAP[docType] || docType || "Document";

  const namePart = `${cleanTitle}${cleanFirstName}`.trim();
  if (namePart) {
    return `${appNumber}_${namePart}_${typeLabel}${ext}`;
  }
  return `${appNumber}_${typeLabel}${ext}`;
}

