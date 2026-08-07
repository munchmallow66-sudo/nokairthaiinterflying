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

export function generateSecurePassword(length = 6): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));

  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password.split("").sort(() => 0.5 - Math.random()).join("");
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
  MILITARY_SERVICE_EXEMPTION: "MilitaryExemption",
  OTHER: "Document",
};

export function formatDocumentFileName(
  appNumber: string,
  title: string = "",
  firstName: string = "",
  docType: string = "OTHER",
  originalName: string = "file.pdf"
): string {
  const cleanOriginal = originalName || "";
  const extMatch = cleanOriginal.match(/(\.[a-zA-Z0-9]+)$/);
  
  // Smart extension fallback: if photo/slip type without extension, default to .jpg instead of .pdf
  const isPhotoType =
    docType.includes("PHOTO") ||
    docType.includes("SLIP") ||
    docType.includes("ID") ||
    docType.includes("PASSPORT");
  const ext = extMatch ? extMatch[1].toLowerCase() : isPhotoType ? ".jpg" : ".pdf";

  const cleanTitle = (title || "").trim().replace(/\s+/g, "");
  const cleanFirstName = (firstName || "").trim().replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "");
  const typeLabel = DOC_TYPE_MAP[docType] || docType || "Document";

  const namePart = `${cleanTitle}${cleanFirstName}`.trim();
  if (namePart) {
    return `${appNumber}_${namePart}_${typeLabel}${ext}`;
  }
  return `${appNumber}_${typeLabel}${ext}`;
}

export function isPdfFile(url?: string | null, filename?: string | null): boolean {
  if (!url && !filename) return false;

  if (url) {
    const lowerUrl = url.toLowerCase();
    
    // 1. Explicit Data URL checks
    if (lowerUrl.startsWith("data:image/")) return false;
    if (lowerUrl.startsWith("data:application/pdf")) return true;

    // 2. Explicit PDF URL patterns (Check PDF extensions FIRST even if path has /image/upload/)
    if (
      lowerUrl.endsWith(".pdf") ||
      lowerUrl.includes(".pdf?") ||
      lowerUrl.includes("/raw/upload/")
    ) {
      return true;
    }

    // 3. Explicit Image URL patterns (e.g. Unsplash, image extensions)
    if (
      lowerUrl.includes("images.unsplash.com") ||
      lowerUrl.endsWith(".jpg") ||
      lowerUrl.endsWith(".jpeg") ||
      lowerUrl.endsWith(".png") ||
      lowerUrl.endsWith(".webp") ||
      lowerUrl.endsWith(".gif") ||
      lowerUrl.includes(".jpg?") ||
      lowerUrl.includes(".jpeg?") ||
      lowerUrl.includes(".png?") ||
      lowerUrl.includes(".webp?")
    ) {
      return false;
    }
  }

  // 4. Fallback check on filename extension
  if (filename) {
    const lowerName = filename.toLowerCase();
    if (
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".webp") ||
      lowerName.endsWith(".gif")
    ) {
      return false;
    }
    if (lowerName.endsWith(".pdf")) {
      return true;
    }
  }

  return false;
}

export function createBlobUrlFromBase64Pdf(dataUrl: string): string | null {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:application/pdf;base64,")) {
      return null;
    }
    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) return null;

    const binaryString = typeof window !== "undefined" ? window.atob(base64Data) : Buffer.from(base64Data, "base64").toString("binary");
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Failed to convert Base64 PDF to Blob URL:", err);
    return null;
  }
}

export function getCloudinaryPdfThumbnail(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes("cloudinary.com") && url.toLowerCase().endsWith(".pdf")) {
    return url.replace(/\.pdf$/i, ".jpg");
  }
  return url;
}




