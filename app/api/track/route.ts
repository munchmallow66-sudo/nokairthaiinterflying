import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { message: "Thai Inter Flying Tracking API. Use POST method with nationalId." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`track_${ip}`, 15, 60 * 1000);

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `คุณส่งคำขอค้นหาถี่เกินไป กรุณารออีก ${rateCheck.resetInSeconds} วินาที` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const queryInput = body.query || body.nationalId || body.appNumber || "";

    if (!queryInput || typeof queryInput !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุหมายเลขใบสมัคร (TIF-2026-XXXX), เลขบัตรประชาชน หรือเบอร์โทรศัพท์" },
        { status: 400 }
      );
    }

    const trimmed = queryInput.trim();
    const cleanedDigits = trimmed.replace(/\D/g, "");

    // Lazy import prisma
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();

    // 1. Try finding application directly by applicationNumber
    let dbApplication: any = null;
    let student: any = null;

    try {
      if (trimmed.toUpperCase().startsWith("TIF")) {
        dbApplication = await prisma.application.findFirst({
          where: { applicationNumber: { equals: trimmed, mode: "insensitive" } },
          include: {
            student: { include: { user: true } },
            course: true,
            interviews: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        });
        if (dbApplication) {
          student = dbApplication.student;
        }
      }

      if (!student && cleanedDigits.length > 0) {
        student = await prisma.student.findFirst({
          where: {
            OR: [
              { nationalId: cleanedDigits },
              { phone: cleanedDigits },
            ],
          },
          include: {
            applications: {
              include: {
                course: true,
                interviews: { orderBy: { createdAt: "desc" }, take: 1 },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
      }
    } catch (dbError) {
      console.warn("DB Query failed:", dbError);
    }

    // Fallback if no matching student or application found in DB
    if (!student && !dbApplication) {
      return NextResponse.json(
        { found: false, error: "ไม่พบข้อมูลการสมัครสำหรับหมายเลขใบสมัคร, เลขบัตรประชาชน หรือเบอร์โทรศัพท์นี้" },
        { status: 404 }
      );
    }

    const appList = student?.applications && student.applications.length > 0
      ? student.applications
      : dbApplication
      ? [dbApplication]
      : [];

    const applications = appList.map((app: any) => {
      let stepIndex = 1;
      let statusLabelTh = "ยื่นใบสมัครแล้ว";
      let statusLabelEn = "Application Submitted";

      switch (app.status) {
        case "ONLINE_REGISTRATION":
          stepIndex = 1;
          statusLabelTh = "1/13: เปิดรับสมัครออนไลน์";
          statusLabelEn = "1/13: Online Application Open";
          break;
        case "SUBMITTED":
        case "DOCS_UNDER_REVIEW":
        case "WAITING_DOCUMENTS":
          stepIndex = 3;
          statusLabelTh = "3/13: ตรวจเอกสารเบื้องต้นโดยเจ้าหน้าที่";
          statusLabelEn = "3/13: Initial Document Review in Progress";
          break;
        case "DOCS_PASSED":
        case "DOCUMENT_VERIFIED":
        case "APPLICATION_FEE_PAID":
          stepIndex = 5;
          statusLabelTh = "5/13: ผ่านการตรวจเอกสารเบื้องต้น (พร้อมชำระค่าสมัคร)";
          statusLabelEn = "5/13: Documents Review Completed (Ready for Payment)";
          break;
        case "PAID":
        case "PAYMENT_PENDING":
        case "PAYMENT_VERIFIED":
        case "OPEN_HOUSE_ATTENDED":
          stepIndex = 6;
          statusLabelTh = "6/13: ชำระค่าสมัครเรียบร้อยแล้ว (เตรียมเข้าร่วมงาน Open House)";
          statusLabelEn = "6/13: Payment Verified (Ready for Open House)";
          break;
        case "PHYSICAL_DOCS_SUBMITTED":
          stepIndex = 7;
          statusLabelTh = "7/13: ส่งเอกสารตัวจริงให้เจ้าหน้าที่เรียบร้อยแล้ว";
          statusLabelEn = "7/13: Physical Original Documents Submitted";
          break;
        case "WRITTEN_EXAM":
          stepIndex = 8;
          statusLabelTh = "8/13: กำหนดวันสอบข้อเขียน";
          statusLabelEn = "8/13: Written Examination Scheduled";
          break;
        case "WRITTEN_EXAM_PASSED":
          stepIndex = 9;
          statusLabelTh = "9/13: ประกาศผล — ผ่านการสอบข้อเขียน";
          statusLabelEn = "9/13: Written Exam Result — Passed";
          break;
        case "INTERVIEW_SCHEDULED":
          stepIndex = 10;
          statusLabelTh = "10/13: กำหนดวันสอบสัมภาษณ์";
          statusLabelEn = "10/13: Interview Scheduled";
          break;
        case "INTERVIEW_PASSED":
          stepIndex = 11;
          statusLabelTh = "11/13: ประกาศผล — ผ่านการสอบสัมภาษณ์";
          statusLabelEn = "11/13: Interview Result — Passed";
          break;
        case "MEDICAL_CHECK_CLASS_1":
          stepIndex = 12;
          statusLabelTh = "12/13: เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน";
          statusLabelEn = "12/13: Class 1 Aviation Medical Check";
          break;
        case "ACCEPTANCE_CONFIRMED":
        case "ACCEPTED":
        case "CONTRACT_SIGNED":
        case "TUITION_FIRST_INSTALLMENT_PAID":
        case "ORIENTATION":
        case "PILOT_JOURNEY_BEGUN":
        case "ENROLLED":
          stepIndex = 13;
          statusLabelTh = "13/13: ยืนยันสิทธิ์เข้าศึกษาสำเร็จ";
          statusLabelEn = "13/13: Seat Acceptance Confirmed";
          break;
        case "REJECTED":
          stepIndex = 0;
          statusLabelTh = "ไม่ผ่านการคัดเลือก (Rejected)";
          statusLabelEn = "Application Not Successful";
          break;
        default:
          stepIndex = 1;
      }

      return {
        id: app.id,
        applicationNumber: app.applicationNumber,
        courseName: "แบบฟอร์มสมัครเรียนการบินออนไลน์",
        status: app.status,
        statusLabelTh,
        statusLabelEn,
        submissionDate: app.createdAt ? (typeof app.createdAt === 'string' ? app.createdAt : app.createdAt.toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
        stepIndex,
        remarks: app.interviews?.[0]?.notes || "เจ้าหน้าที่กำลังดำเนินการตามลำดับขั้นตอน",
        updatedAt: app.updatedAt ? (typeof app.updatedAt === 'string' ? app.updatedAt : app.updatedAt.toLocaleString("th-TH")) : "อัปเดตล่าสุดวันนี้",
        documents: app.documents || student?.documents || [],
      };
    });

    const studentName = student
      ? `${student.firstNameTh || student.firstNameEn} ${student.lastNameTh || student.lastNameEn}`
      : "นาย สมชาย ใจดี";

    return NextResponse.json({
      found: true,
      studentName,
      nationalId: student?.nationalId || cleanedDigits || "1100200345678",
      applications,
    });
  } catch (error: any) {
    console.error("Tracking API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
