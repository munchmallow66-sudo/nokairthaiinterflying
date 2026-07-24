import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nationalId } = body;

    if (!nationalId || typeof nationalId !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุเลขบัตรประจำตัวประชาชน / Please enter National ID" },
        { status: 400 }
      );
    }

    const cleanedId = nationalId.replace(/\D/g, "").trim();

    if (cleanedId.length !== 13) {
      return NextResponse.json(
        { error: "เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก / National ID must be 13 digits" },
        { status: 400 }
      );
    }

    // Try finding student by nationalId or phone in DB
    let student: any = null;
    try {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { nationalId: cleanedId },
            { phone: cleanedId },
          ],
        },
        include: {
          applications: {
            include: {
              course: true,
              interviews: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch (dbError) {
      console.warn("DB Query failed, using fallback tracking data if demo ID used:", dbError);
    }

    // If demo test ID used or DB is empty, return a demo tracking result for demonstration
    if (!student && (cleanedId === "1234567890123" || cleanedId === "1100100200300")) {
      return NextResponse.json({
        found: true,
        studentName: "นาย ภัทรพล การบินดี (Pattarapol Karnbindee)",
        nationalId: cleanedId,
        applications: [
          {
            id: "demo-app-01",
            applicationNumber: "TIF-2026-0842",
            courseName: "หลักสูตรนักบินพาณิชย์ตรี (Commercial Pilot License - CPL + IR)",
            status: "DOCUMENT_VERIFIED",
            statusLabelTh: "ผ่านการตรวจเอกสารเรียบร้อยแล้ว",
            statusLabelEn: "Documents Approved & Verified",
            submissionDate: "2026-08-05",
            stepIndex: 2, // 1: Submitted, 2: Document Verified, 3: Interview, 4: Accepted
            remarks: "เอกสารครบถ้วนแล้ว เจ้าหน้าที่จะแจ้งวันเวลาทดสอบและสัมภาษณ์ทางอีเมล",
            updatedAt: "2026-08-06 10:30 น.",
          },
        ],
      });
    }

    if (!student || student.applications.length === 0) {
      return NextResponse.json(
        {
          found: false,
          error: "ไม่พบข้อมูลการสมัครสำหรับเลขบัตรประชาชนนี้ / No application found for this National ID",
        },
        { status: 444 } // custom or 404
      );
    }

    // Map applications
    const applications = student.applications.map((app: any) => {
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
        courseName: app.course?.name || "หลักสูตรนักบินพาณิชย์ตรี (CPL)",
        status: app.status,
        statusLabelTh,
        statusLabelEn,
        submissionDate: app.createdAt.toISOString().split("T")[0],
        stepIndex,
        remarks: app.interviews?.[0]?.notes || "เจ้าหน้าที่กำลังดำเนินการตามลำดับขั้นตอน",
        updatedAt: app.updatedAt.toLocaleString("th-TH"),
      };
    });

    return NextResponse.json({
      found: true,
      studentName: `${student.firstNameTh} ${student.lastNameTh}`,
      nationalId: student.nationalId,
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
