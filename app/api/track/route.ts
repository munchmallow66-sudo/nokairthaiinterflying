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
    const inputPassword = (body.password || "").toString().trim();

    if (!queryInput || typeof queryInput !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุหมายเลขใบสมัคร (TIF-2026-XXXX), เลขบัตรประชาชน หรือเบอร์โทรศัพท์" },
        { status: 400 }
      );
    }

    if (!inputPassword) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสผ่าน (Password) สำหรับติดตามสถานะการสมัคร" },
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
            payments: { orderBy: { createdAt: "desc" } },
            documents: { orderBy: { uploadedAt: "asc" } },
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
                payments: { orderBy: { createdAt: "desc" } },
                documents: { orderBy: { uploadedAt: "asc" } },
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

    const rawAppList = dbApplication
      ? [dbApplication]
      : student?.applications && student.applications.length > 0
      ? student.applications
      : [];

    // Deduplicate appList by applicationNumber or id
    const uniqueAppMap = new Map<string, any>();
    rawAppList.forEach((app: any) => {
      const key = app.applicationNumber || app.id;
      if (key && !uniqueAppMap.has(key)) {
        uniqueAppMap.set(key, app);
      }
    });

    const appList = Array.from(uniqueAppMap.values());

    // Fail closed. The old gate was `if (targetApp && targetApp.password)`, so
    // an application row with a NULL/blank password let anyone through on the
    // application number alone. It also only checked appList[0], meaning one
    // password unlocked every application returned by a nationalId/phone
    // lookup. Only applications this password actually opens are returned.
    const authorizedApps = appList.filter((app: any) => {
      const stored = (app.password || "").toString().trim();
      return stored !== "" && stored === inputPassword;
    });

    if (authorizedApps.length === 0) {
      return NextResponse.json(
        { found: false, error: "รหัสผ่าน (Password) ไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง" },
        { status: 401 }
      );
    }

    const applications = authorizedApps.map((app: any) => {
      // Whether a payment slip is on file is a fact the applicant's page must
      // not have to guess at. It used to infer it from keywords in `remarks`,
      // which meant an applicant who had already paid was shown the payment
      // button again whenever the wording did not match.
      const paymentRows: any[] = Array.isArray(app.payments) ? app.payments : [];
      const activePayment = paymentRows.find((p) => p.status !== "REJECTED") || null;
      const latestPayment = paymentRows[0] || null;

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
          stepIndex = 2;
          statusLabelTh = "2/13: กรอกใบสมัคร + แนบเอกสารเรียบร้อย";
          statusLabelEn = "2/13: Submitted & Attached Docs";
          break;
        case "DOCS_UNDER_REVIEW":
        case "WAITING_DOCUMENTS":
          stepIndex = 3;
          statusLabelTh = "3/13: ตรวจเอกสารเบื้องต้นโดยเจ้าหน้าที่";
          statusLabelEn = "3/13: Initial Document Review in Progress";
          break;
        case "DOCS_PASSED":
        case "DOCUMENT_VERIFIED":
          stepIndex = 4;
          statusLabelTh = "4/13: ผ่านการตรวจเอกสารเบื้องต้น";
          statusLabelEn = "4/13: Documents Review Passed";
          break;
        case "APPLICATION_FEE_PAID":
          stepIndex = 5;
          statusLabelTh = "5/13: ชำระค่าสมัคร 1,800 บาทเรียบร้อยแล้ว";
          statusLabelEn = "5/13: App Fee Paid (1,800 THB)";
          break;
        // Still step 5: the slip is in but the fee is not approved yet, so this
        // must not read as though the applicant had already reached Open House.
        case "PAYMENT_PENDING":
          stepIndex = 5;
          statusLabelTh = "5/13: ตรวจสอบสลิปชำระเงิน 1,800 บาท";
          statusLabelEn = "5/13: Payment Slip Under Verification";
          break;
        case "PAID":
        case "PAYMENT_VERIFIED":
        case "OPEN_HOUSE_ATTENDED":
          stepIndex = 6;
          statusLabelTh = "6/13: เข้าร่วมงาน Open House";
          statusLabelEn = "6/13: Attended Open House";
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
        // The round the applicant was rejected in is read from the column staff
        // wrote it to. It used to be guessed from keywords in `remarks`, so a
        // message worded without the word "ข้อเขียน" reported a failed exam as
        // step 3, "documents incomplete".
        case "REJECTED":
          if (app.rejectedStage === "INTERVIEW") {
            stepIndex = 11;
            statusLabelTh = "11/13: ประกาศผลสัมภาษณ์ (ขอขอบพระคุณที่เข้าร่วมการคัดเลือก)";
            statusLabelEn = "11/13: Panel Interview Results";
          } else if (app.rejectedStage === "WRITTEN_EXAM") {
            stepIndex = 9;
            statusLabelTh = "9/13: ประกาศผลสอบข้อเขียน (ขอขอบพระคุณที่เข้าร่วมการคัดเลือก)";
            statusLabelEn = "9/13: Written Exam Results";
          } else {
            stepIndex = 3;
            statusLabelTh = "3/13: ตรวจเอกสารเบื้องต้น (ข้อมูลและเอกสารไม่สมบูรณ์)";
            statusLabelEn = "3/13: Initial Document Review (Incomplete Information and Documents)";
          }
          break;
        default:
          stepIndex = 1;
      }

      return {
        id: app.id,
        applicationNumber: app.applicationNumber,
        // Null unless status is REJECTED. The page renders the outcome from
        // this, never from the wording of `remarks`.
        rejectedStage: app.rejectedStage ?? null,
        // The tracking password is never echoed back — the client already has
        // it, and shipping it in the response puts it in browser caches, logs
        // and localStorage via ApplicationContext.
        courseName: "แบบฟอร์มสมัครเรียนการบินออนไลน์",
        status: app.status,
        statusLabelTh,
        statusLabelEn,
        submissionDate: app.createdAt ? (typeof app.createdAt === 'string' ? app.createdAt : app.createdAt.toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
        stepIndex,
        // The application's own remarks come first. They are what the admin
        // actually wrote — rejection reasons, document requests, exam results —
        // and dropping them straight to the interview note meant the applicant
        // never saw a single message staff sent. It also broke getStepGuidance()
        // on the client, which decides what to tell the applicant by looking for
        // keywords in this string and so always fell through to its default.
        remarks:
          app.remarks || app.interviews?.[0]?.notes || "เจ้าหน้าที่กำลังดำเนินการตามลำดับขั้นตอน",
        updatedAt: app.updatedAt ? (typeof app.updatedAt === 'string' ? app.updatedAt : app.updatedAt.toLocaleString("th-TH")) : "อัปเดตล่าสุดวันนี้",
        joinOpenHouse: app.joinOpenHouse ?? null,
        // `hasPaymentSlip` answers "has this applicant already paid?" — a
        // rejected slip does not count, so they can attach a replacement.
        hasPaymentSlip: !!activePayment,
        paymentStatus: latestPayment?.status || null,
        // Neither query used to include these, and Student has no documents
        // relation for the fallback to reach either, so this was always []. An
        // applicant told "เอกสารไม่ผ่าน" got no list and no reason — and a
        // per-document rejection that left the status alone showed nothing at
        // all. Only the fields the track page renders are exposed; publicId is
        // an internal Cloudinary handle and stays server-side.
        documents: (Array.isArray(app.documents) ? app.documents : []).map((doc: any) => ({
          id: doc.id,
          type: doc.type,
          secureUrl: doc.secureUrl,
          originalName: doc.originalName,
          isVerified: !!doc.isVerified,
          isRejected: !!doc.isRejected,
          rejectReason: doc.rejectReason || undefined,
        })),
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
