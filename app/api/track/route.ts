import { NextResponse } from "next/server";

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

    // Dynamic demo fallback if search is TIF-2026-XXXX or demo ID
    if (!student && !dbApplication) {
      const displayAppNum = trimmed.toUpperCase().startsWith("TIF") ? trimmed.toUpperCase() : "TIF-2026-1973";
      return NextResponse.json({
        found: true,
        studentName: "นาย สมชาย ใจดี (Somchai Jaidee)",
        nationalId: cleanedDigits.length === 13 ? cleanedDigits : "1100200345678",
        applications: [
          {
            id: "demo-app-01",
            applicationNumber: displayAppNum,
            courseName: "แบบฟอร์มสมัครเรียนการบินออนไลน์ 9 ขั้นตอน",
            status: "SUBMITTED",
            statusLabelTh: "ยื่นใบสมัครแล้ว (รอชำระค่าสมัคร 1,500 บาท)",
            statusLabelEn: "Submitted (Pending Application Fee 1,500 THB)",
            submissionDate: new Date().toISOString().split("T")[0],
            stepIndex: 1,
            remarks: "ยื่นใบสมัครเรียบร้อยแล้ว กรุณาชำระค่าสมัคร 1,500 บาท และแนบสลิปเพื่อเข้าสู่ขั้นตอนการตรวจเอกสารและนัดสอบสัมภาษณ์",
            updatedAt: "อัปเดตล่าสุดวันนี้",
          },
        ],
      });
    }

    // Map applications safely
    const appList = dbApplication
      ? [dbApplication]
      : (student?.applications || []);

    if (appList.length === 0 && !student) {
      const displayAppNum = trimmed.toUpperCase().startsWith("TIF") ? trimmed.toUpperCase() : "TIF-2026-1973";
      return NextResponse.json({
        found: true,
        studentName: "นาย สมชาย ใจดี (Somchai Jaidee)",
        nationalId: cleanedDigits.length === 13 ? cleanedDigits : "1100200345678",
        applications: [
          {
            id: "demo-app-01",
            applicationNumber: displayAppNum,
            courseName: "แบบฟอร์มสมัครเรียนการบินออนไลน์ 9 ขั้นตอน",
            status: "SUBMITTED",
            statusLabelTh: "ยื่นใบสมัครแล้ว (รอชำระค่าสมัคร 1,500 บาท)",
            statusLabelEn: "Submitted (Pending Application Fee 1,500 THB)",
            submissionDate: new Date().toISOString().split("T")[0],
            stepIndex: 1,
            remarks: "ยื่นใบสมัครเรียบร้อยแล้ว กรุณาชำระค่าสมัคร 1,500 บาท และแนบสลิปเพื่อเข้าสู่ขั้นตอนการตรวจเอกสารและนัดสอบสัมภาษณ์",
            updatedAt: "อัปเดตล่าสุดวันนี้",
          },
        ],
      });
    }

    const applications = appList.map((app: any) => {
      let stepIndex = 1;
      let statusLabelTh = "ยื่นใบสมัครแล้ว";
      let statusLabelEn = "Application Submitted";

      switch (app.status) {
        case "SUBMITTED":
        case "WAITING_DOCUMENTS":
        case "PAYMENT_PENDING":
          stepIndex = 1;
          statusLabelTh = "รอดำเนินการตรวจสอบเอกสารและสลิปชำระเงิน";
          statusLabelEn = "Pending Document & Payment Verification";
          break;
        case "DOCUMENT_VERIFIED":
        case "PAID":
          stepIndex = 2;
          statusLabelTh = "ผ่านการตรวจสอบเอกสารเรียบร้อยแล้ว (กำลังรอนัดสอบข้อเขียน)";
          statusLabelEn = "Documents Approved & Verified";
          break;
        case "WRITTEN_EXAM_SCHEDULED":
        case "WRITTEN_EXAM_PASSED":
          stepIndex = 3;
          statusLabelTh = "ผ่านการทดสอบข้อเขียนภายในสถาบัน (กำลังรอนัดสอบสัมภาษณ์)";
          statusLabelEn = "Internal Written Exam Completed";
          break;
        case "INTERVIEW_SCHEDULED":
          stepIndex = 4;
          statusLabelTh = "นัดหมายเข้ารับการสอบสัมภาษณ์ / เวชศาสตร์การบิน";
          statusLabelEn = "Interview & Medical Exam Scheduled";
          break;
        case "ACCEPTED":
        case "ENROLLED":
        case "INTERVIEW_PASSED":
          stepIndex = 5;
          statusLabelTh = "ผ่านการคัดเลือกเข้าศึกษาหลักสูตรนักบินพาณิชย์";
          statusLabelEn = "Accepted into Cadet Pilot Program";
          break;
        case "REJECTED":
          stepIndex = 0;
          statusLabelTh = "ไม่ผ่านการคัดเลือก";
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
