import { Role, DocumentType, PaymentStatus } from "@prisma/client";

export type ApplicationStatus =
  | "ONLINE_REGISTRATION"
  | "SUBMITTED"
  | "DOCS_UNDER_REVIEW"
  | "DOCS_PASSED"
  | "APPLICATION_FEE_PAID"
  | "OPEN_HOUSE_ATTENDED"
  | "PHYSICAL_DOCS_SUBMITTED"
  | "WRITTEN_EXAM"
  | "WRITTEN_EXAM_PASSED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_PASSED"
  | "MEDICAL_CHECK_CLASS_1"
  | "ACCEPTANCE_CONFIRMED"
  | "CONTRACT_SIGNED"
  | "TUITION_FIRST_INSTALLMENT_PAID"
  | "ORIENTATION"
  | "PILOT_JOURNEY_BEGUN"
  | "DRAFT"
  | "WAITING_DOCUMENTS"
  | "DOCUMENT_VERIFIED"
  | "ACCEPTED"
  | "REJECTED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "ENROLLED";

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
  /** Which round a REJECTED applicant was rejected in; null for every other status. */
  rejectedStage?: "DOCUMENT" | "WRITTEN_EXAM" | "INTERVIEW" | null;
  password?: string | null;
  remarks?: string;
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
  joinOpenHouse?: boolean;
  openHouseAttendees?: number;
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

export interface WorkflowStepDef {
  step: number;
  key: ApplicationStatus;
  titleTh: string;
  titleEn: string;
  badgeClass: string;
}

export const PILOT_WORKFLOW_STEPS: WorkflowStepDef[] = [
  { step: 1, key: "ONLINE_REGISTRATION", titleTh: "เปิดรับสมัครออนไลน์", titleEn: "Online Application Open", badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { step: 2, key: "SUBMITTED", titleTh: "กรอกใบสมัคร + แนบเอกสาร", titleEn: "Submitted & Attached Docs", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { step: 3, key: "DOCS_UNDER_REVIEW", titleTh: "ตรวจเอกสารเบื้องต้น", titleEn: "Docs Under Review", badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  { step: 4, key: "DOCS_PASSED", titleTh: "ผ่านการตรวจเอกสาร", titleEn: "Documents Review Completed", badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  { step: 5, key: "APPLICATION_FEE_PAID", titleTh: "ชำระค่าสมัคร 1,800 บาท", titleEn: "App Fee Paid (1,800 THB)", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { step: 6, key: "OPEN_HOUSE_ATTENDED", titleTh: "เข้าร่วม Open House", titleEn: "Attended Open House", badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
  { step: 7, key: "PHYSICAL_DOCS_SUBMITTED", titleTh: "ส่งเอกสารตัวจริง", titleEn: "Physical Docs Submitted", badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
  { step: 8, key: "WRITTEN_EXAM", titleTh: "สอบข้อเขียน", titleEn: "Written Exam", badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
  { step: 9, key: "WRITTEN_EXAM_PASSED", titleTh: "ประกาศผลสอบ", titleEn: "Written Exam Results", badgeClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" },
  { step: 10, key: "INTERVIEW_SCHEDULED", titleTh: "สัมภาษณ์", titleEn: "Interview Scheduled", badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { step: 11, key: "INTERVIEW_PASSED", titleTh: "ประกาศผลสัมภาษณ์", titleEn: "Interview Results", badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
  { step: 12, key: "MEDICAL_CHECK_CLASS_1", titleTh: "ตรวจสุขภาพ Class 1", titleEn: "Class 1 Medical Check", badgeClass: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
  { step: 13, key: "ACCEPTANCE_CONFIRMED", titleTh: "ยืนยันสิทธิ์สำเร็จ", titleEn: "Acceptance Confirmed", badgeClass: "bg-tif-gold/10 text-tif-gold border-tif-gold/30" },
];
