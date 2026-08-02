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
            status: "WAITING_DOCUMENTS",
            statusLabelTh: "⚠️ เอกสารบางรายการต้องแนบใหม่ (Re-upload Required)",
            statusLabelEn: "⚠️ Re-upload Required / Additional Documents Needed",
            submissionDate: new Date().toISOString().split("T")[0],
            stepIndex: 1,
            remarks: "[แจ้งเอกสารผิด]: ปฏิเสธเอกสาร 'สำเนาบัตรประชาชน' - เหตุผล: รูปถ่ายไม่ชัดเจน กรุณาถ่ายฉบับจริงแล้วอัปโหลดใหม่",
            updatedAt: "อัปเดตล่าสุดวันนี้",
            documents: [
              {
                id: "doc-demo-1",
                type: "NATIONAL_ID",
                secureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
                originalName: "National_ID_Card_Blurry.jpg",
                isVerified: false,
                isRejected: true,
                rejectReason: "รูปถ่ายไม่ชัดเจน กรุณาถ่ายฉบับจริงแล้วอัปโหลดใหม่",
              },
              {
                id: "doc-demo-2",
                type: "PASSPORT_PHOTO",
                secureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                originalName: "Passport_Photo_1Inch.jpg",
                isVerified: true,
                isRejected: false,
              },
            ],
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
            status: "WAITING_DOCUMENTS",
            statusLabelTh: "⚠️ เอกสารบางรายการต้องแนบใหม่ (Re-upload Required)",
            statusLabelEn: "⚠️ Re-upload Required / Additional Documents Needed",
            submissionDate: new Date().toISOString().split("T")[0],
            stepIndex: 1,
            remarks: "[แจ้งเอกสารผิด]: ปฏิเสธเอกสาร 'สำเนาบัตรประชาชน' - เหตุผล: รูปถ่ายไม่ชัดเจน กรุณาถ่ายฉบับจริงแล้วอัปโหลดใหม่",
            updatedAt: "อัปเดตล่าสุดวันนี้",
            documents: [
              {
                id: "doc-demo-1",
                type: "NATIONAL_ID",
                secureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
                originalName: "National_ID_Card_Blurry.jpg",
                isVerified: false,
                isRejected: true,
                rejectReason: "รูปถ่ายไม่ชัดเจน กรุณาถ่ายฉบับจริงแล้วอัปโหลดใหม่",
              },
              {
                id: "doc-demo-2",
                type: "PASSPORT_PHOTO",
                secureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                originalName: "Passport_Photo_1Inch.jpg",
                isVerified: true,
                isRejected: false,
              },
            ],
          },
        ],
      });
    }

    const applications = appList.map((app: any) => {
      let stepIndex = 1;
      let statusLabelTh = "ยื่นใบสมัครแล้ว";
      let statusLabelEn = "Application Submitted";

      switch (app.status) {
        case "ONLINE_REGISTRATION":
          stepIndex = 1;
          statusLabelTh = "1/17: เปิดรับสมัครออนไลน์";
          statusLabelEn = "1/17: Online Application Open";
          break;
        case "SUBMITTED":
          stepIndex = 2;
          statusLabelTh = "2/17: กรอกใบสมัคร + แนบเอกสารเรียบร้อยแล้ว";
          statusLabelEn = "2/17: Application Submitted & Documents Attached";
          break;
        case "DOCS_UNDER_REVIEW":
        case "WAITING_DOCUMENTS":
          stepIndex = 3;
          statusLabelTh = "3/17: อยู่ระหว่างการตรวจเอกสารเบื้องต้นโดยเจ้าหน้าที่";
          statusLabelEn = "3/17: Initial Document Review in Progress";
          break;
        case "DOCS_PASSED":
        case "DOCUMENT_VERIFIED":
          stepIndex = 4;
          statusLabelTh = "4/17: ผ่านการตรวจเอกสารเบื้องต้น (พร้อมชำระค่าสมัคร)";
          statusLabelEn = "4/17: Initial Docs Screening Passed";
          break;
        case "APPLICATION_FEE_PAID":
        case "PAID":
        case "PAYMENT_PENDING":
          stepIndex = 5;
          statusLabelTh = "5/17: ชำระค่าสมัคร 1,800 บาทเรียบร้อยแล้ว";
          statusLabelEn = "5/17: Application Fee (1,800 THB) Paid";
          break;
        case "OPEN_HOUSE_ATTENDED":
          stepIndex = 6;
          statusLabelTh = "6/17: เข้าร่วมกิจกรรม Open House เรียบร้อยแล้ว";
          statusLabelEn = "6/17: Attended Open House Event";
          break;
        case "PHYSICAL_DOCS_SUBMITTED":
          stepIndex = 7;
          statusLabelTh = "7/17: ส่งเอกสารตัวจริงให้เจ้าหน้าที่เรียบร้อยแล้ว";
          statusLabelEn = "7/17: Physical Original Documents Submitted";
          break;
        case "WRITTEN_EXAM":
          stepIndex = 8;
          statusLabelTh = "8/17: กำหนดวันสอบข้อเขียน";
          statusLabelEn = "8/17: Written Examination Scheduled";
          break;
        case "WRITTEN_EXAM_PASSED":
          stepIndex = 9;
          statusLabelTh = "9/17: ประกาศผล — ผ่านการสอบข้อเขียน";
          statusLabelEn = "9/17: Written Exam Result — Passed";
          break;
        case "INTERVIEW_SCHEDULED":
          stepIndex = 10;
          statusLabelTh = "10/17: กำหนดวันสอบสัมภาษณ์";
          statusLabelEn = "10/17: Interview Scheduled";
          break;
        case "INTERVIEW_PASSED":
          stepIndex = 11;
          statusLabelTh = "11/17: ประกาศผล — ผ่านการสอบสัมภาษณ์";
          statusLabelEn = "11/17: Interview Result — Passed";
          break;
        case "MEDICAL_CHECK_CLASS_1":
          stepIndex = 12;
          statusLabelTh = "12/17: เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน";
          statusLabelEn = "12/17: Class 1 Aviation Medical Check";
          break;
        case "ACCEPTANCE_CONFIRMED":
        case "ACCEPTED":
          stepIndex = 13;
          statusLabelTh = "13/17: ยืนยันสิทธิ์เข้าศึกษาเรียบร้อยแล้ว";
          statusLabelEn = "13/17: Seat Acceptance Confirmed";
          break;
        case "CONTRACT_SIGNED":
          stepIndex = 14;
          statusLabelTh = "14/17: ลงนามสัญญาการฝึกอบรมศิษย์บิน";
          statusLabelEn = "14/17: Flight Training Contract Signed";
          break;
        case "TUITION_FIRST_INSTALLMENT_PAID":
          stepIndex = 15;
          statusLabelTh = "15/17: ชำระค่าเรียนงวดแรกเรียบร้อยแล้ว";
          statusLabelEn = "15/17: 1st Tuition Fee Installment Paid";
          break;
        case "ORIENTATION":
          stepIndex = 16;
          statusLabelTh = "16/17: ปฐมนิเทศศิษย์บินใหม่";
          statusLabelEn = "16/17: Cadet Student Orientation";
          break;
        case "PILOT_JOURNEY_BEGUN":
        case "ENROLLED":
          stepIndex = 17;
          statusLabelTh = "17/17: เริ่มต้นเส้นทางนักบินอาชีพ! (Pilot Journey Begun)";
          statusLabelEn = "17/17: Start Pilot Journey!";
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
