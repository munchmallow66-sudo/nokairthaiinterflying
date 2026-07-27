import { Role, ApplicationStatus, DocumentType, PaymentStatus } from "@prisma/client";

export type UserRole = Role;
export type AppStatus = ApplicationStatus;
export type DocType = DocumentType;
export type PayStatus = PaymentStatus;

export interface ApplicationWithDetails {
  id: string;
  applicationNumber: string;
  branch: string;
  preferredStartDate?: Date | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    title?: string | null;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    nickname?: string | null;
    gender?: string | null;
    birthday?: Date | string | null;
    age?: number | null;
    nationality?: string | null;
    religion?: string | null;
    phone: string;
    lineId?: string | null;
    facebook?: string | null;
    nationalId?: string | null;
    passport?: string | null;
    user: {
      email: string;
      image?: string | null;
    };
    address?: {
      currentAddress: string;
      province: string;
      district: string;
      subdistrict: string;
      postalCode: string;
    } | null;
    education?: {
      school: string;
      university?: string | null;
      degree: string;
      gpax: number;
      graduationYear: number;
    } | null;
    emergency?: {
      name: string;
      relationship: string;
      phone: string;
      address: string;
    } | null;
    parent?: {
      fatherName?: string | null;
      motherName?: string | null;
      occupation?: string | null;
      phone?: string | null;
    } | null;
    medical?: {
      height: number;
      weight: number;
      bloodType: string;
      medicalConditions?: string | null;
      allergy?: string | null;
      medication?: string | null;
    } | null;
    english?: {
      toeicScore?: number | null;
      ieltsScore?: number | null;
      icaoLevel?: number | null;
      otherCertificates?: string | null;
    } | null;
  };
  course: {
    id: string;
    name: string;
    code: string;
    price: number;
    duration: string;
  };
  documents: {
    id: string;
    type: DocumentType;
    secureUrl: string;
    publicId: string;
    originalName: string;
    isVerified: boolean;
    isRejected?: boolean;
    rejectReason?: string;
    uploadedAt: Date;
  }[];
  payments: {
    id: string;
    amount: number;
    slipUrl: string;
    invoiceNo: string;
    receiptNo?: string | null;
    status: PaymentStatus;
    createdAt: Date;
  }[];
  interviews: {
    id: string;
    scheduledAt: Date;
    location: string;
    interviewer: string;
    result?: string | null;
    passed?: boolean | null;
  }[];
  adminNotes: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      name?: string | null;
      email: string;
    };
  }[];
}

export interface SearchFilterParams {
  query?: string;
  status?: string;
  courseId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
