import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { formatDocumentFileName } from "@/lib/utils";
import {
  UPLOADABLE_DOC_TYPES,
  PRESERVED_DOC_TYPES,
  canonicalDocType,
  canReplaceSingleDoc,
  docTypeFamily,
  getResubmitDocTypes,
  isDocumentReviewFailed,
} from "@/lib/document-review";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface IncomingDoc {
  type: string;
  secureUrl: string;
  publicId?: string;
  originalName?: string;
  fileSize?: number;
}

/**
 * Applicant-side document (re)submission.
 *
 * The track page used to "re-upload" a document entirely in React state: the
 * file went to Cloudinary and the new card appeared, but nothing was ever
 * written to Postgres, so the fix vanished on refresh and staff kept seeing the
 * rejected file. This is the endpoint that actually persists it.
 *
 * Authentication is the application number plus the tracking password, the same
 * credential pair POST /api/track verifies, and it fails closed the same way.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`doc_resubmit_${ip}`, 10, 60 * 1000);

    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: `ท่านส่งเอกสารถี่เกินไป กรุณารออีก ${rateCheck.resetInSeconds} วินาที` },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const appNum = (body.appNum || body.applicationNumber || "").toString().trim();
    const inputPassword = (body.password || "").toString().trim();
    const replaceAll = body.replaceAll === true;
    const incoming: IncomingDoc[] = Array.isArray(body.documents) ? body.documents : [];

    if (!appNum) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุหมายเลขใบสมัคร (TIF-2026-XXXX)" },
        { status: 400 }
      );
    }

    if (!inputPassword) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุรหัสผ่าน (Password) สำหรับส่งเอกสาร" },
        { status: 400 }
      );
    }

    if (incoming.length === 0 || incoming.length > 20) {
      return NextResponse.json(
        { success: false, error: "จำนวนไฟล์เอกสารไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Normalise and validate every entry before touching the database, so a
    // single bad type cannot leave a half-replaced document set behind.
    const docs: IncomingDoc[] = [];

    for (const doc of incoming) {
      const type = (doc?.type || "").toString().trim().toUpperCase();
      const secureUrl = (doc?.secureUrl || "").toString().trim();

      // The payment slip is deliberately absent from the allowlist: slips are
      // filed through POST /api/payments, which records the amount with them.
      if (!UPLOADABLE_DOC_TYPES.has(type)) {
        return NextResponse.json(
          { success: false, error: `ประเภทเอกสารไม่ถูกต้อง: ${doc?.type || "-"}` },
          { status: 400 }
        );
      }
      if (!secureUrl) {
        return NextResponse.json(
          { success: false, error: "ไม่พบไฟล์ที่อัปโหลดสำหรับเอกสารบางรายการ" },
          { status: 400 }
        );
      }

      docs.push({
        type,
        secureUrl,
        publicId: (doc?.publicId || "").toString().trim() || undefined,
        originalName: (doc?.originalName || "").toString().trim() || undefined,
        fileSize: typeof doc?.fileSize === "number" ? doc.fileSize : undefined,
      });
    }

    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();

    const application = await prisma.application.findFirst({
      where: { applicationNumber: { equals: appNum, mode: "insensitive" } },
      include: {
        documents: true,
        student: { select: { title: true, firstNameEn: true, firstNameTh: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการสมัครสำหรับหมายเลขใบสมัครนี้" },
        { status: 404 }
      );
    }

    // Fail closed, exactly as /api/track does: a blank stored password opens
    // nothing, so an application number alone is never enough to overwrite
    // somebody else's documents.
    const storedPassword = (application.password || "").toString().trim();
    if (storedPassword === "" || storedPassword !== inputPassword) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่าน (Password) ไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง" },
        { status: 401 }
      );
    }

    const reviewFailed = isDocumentReviewFailed(application);

    if (replaceAll) {
      // The full-set replacement exists for one situation: staff failed the
      // document review. Outside it, the applicant's approved file set stays.
      if (!reviewFailed) {
        return NextResponse.json(
          {
            success: false,
            error:
              "ใบสมัครของท่านไม่ได้อยู่ในสถานะที่ต้องส่งเอกสารใหม่ทั้งชุด กรุณาตรวจสอบสถานะล่าสุดอีกครั้ง",
          },
          { status: 409 }
        );
      }

      const { required } = getResubmitDocTypes(application.documents);
      const submitted = new Set(docs.map((d) => canonicalDocType(d.type)));
      const missing = required.filter((t) => !submitted.has(t));

      if (missing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            missing,
            error: `กรุณาแนบเอกสารให้ครบทุกรายการ (ยังขาดอยู่ ${missing.length} รายการ)`,
          },
          { status: 400 }
        );
      }
    } else {
      const blocked = docs.find((d) => !canReplaceSingleDoc(application, d.type));
      if (blocked) {
        return NextResponse.json(
          {
            success: false,
            error:
              "ไม่สามารถแก้ไขเอกสารรายการนี้ได้ในสถานะปัจจุบันของใบสมัคร กรุณาตรวจสอบสถานะล่าสุดอีกครั้ง",
          },
          { status: 409 }
        );
      }
    }

    const studentTitle = application.student?.title || "";
    const studentFirstName =
      application.student?.firstNameEn || application.student?.firstNameTh || "";

    // Which stored rows this submission supersedes. A full resubmission clears
    // the whole application set (other steps' evidence excepted); a single file clears
    // only its own type and that type's legacy spellings. OTHER is excluded from
    // that rule — it is the "extra attachment" slot, so several may coexist and
    // a new one must be added alongside them, not on top of them.
    const supersededTypes = replaceAll
      ? application.documents
          .map((d) => d.type as string)
          .filter((t) => !PRESERVED_DOC_TYPES.has(t))
      : Array.from(
          new Set(
            docs
              .filter((d) => canonicalDocType(d.type) !== "OTHER")
              .flatMap((d) => docTypeFamily(d.type))
          )
        );

    const survivingRejectedCount = application.documents.filter(
      (d) => d.isRejected && !supersededTypes.includes(d.type as string)
    ).length;

    // Back to Step 3 for staff to look at again. Left alone for the later-stage
    // medical certificate, and while other rejected files are still outstanding
    // after a single-file fix — that application has not been made whole yet.
    let nextStatus: string | null = null;
    let nextRemarks: string | null = null;

    if (replaceAll) {
      nextStatus = "DOCS_UNDER_REVIEW";
      nextRemarks =
        "ผู้สมัครอัปโหลดเอกสารประกอบการสมัครชุดใหม่ครบถ้วนแล้ว อยู่ระหว่างรอเจ้าหน้าที่ดำเนินการตรวจเอกสารอีกครั้ง";
    } else if (reviewFailed && survivingRejectedCount === 0) {
      nextStatus = "DOCS_UNDER_REVIEW";
      nextRemarks =
        "ผู้สมัครส่งเอกสารฉบับใหม่เข้าระบบครบแล้ว อยู่ระหว่างรอเจ้าหน้าที่ดำเนินการตรวจเอกสารอีกครั้ง";
    }

    const result = await prisma.$transaction(
      async (tx) => {
        if (supersededTypes.length > 0) {
          await tx.document.deleteMany({
            where: {
              applicationId: application.id,
              type: { in: supersededTypes as any[] },
            },
          });
        }

        for (const doc of docs) {
          await tx.document.create({
            data: {
              applicationId: application.id,
              type: doc.type as any,
              secureUrl: doc.secureUrl,
              publicId: doc.publicId || `tif_resubmit_${Date.now()}_${doc.type}`,
              originalName: formatDocumentFileName(
                application.applicationNumber,
                studentTitle,
                studentFirstName,
                doc.type,
                doc.originalName || "file.pdf"
              ),
              fileSize: doc.fileSize ?? null,
              // A replacement always re-enters the queue unreviewed, whatever
              // the file it replaced had been marked as.
              isVerified: false,
              isRejected: false,
              rejectReason: null,
            },
          });
        }

        if (nextStatus) {
          await tx.application.update({
            where: { id: application.id },
            data: { status: nextStatus as any, remarks: nextRemarks },
          });
        }

        return tx.document.findMany({
          where: { applicationId: application.id },
          orderBy: { uploadedAt: "asc" },
        });
      },
      { maxWait: 10000, timeout: 25000 }
    );

    // Audit trail for staff. Never allowed to fail the resubmission itself —
    // the documents are already safely stored by this point.
    try {
      await prisma.activityLog.create({
        data: {
          applicationId: application.id,
          action: replaceAll ? "APPLICANT_RESUBMIT_ALL_DOCS" : "APPLICANT_REPLACE_DOC",
          details: replaceAll
            ? `ผู้สมัครส่งเอกสารใหม่ทั้งชุด จำนวน ${docs.length} รายการ`
            : `ผู้สมัครส่งเอกสารใหม่ ${docs.map((d) => d.type).join(", ")}`,
        },
      });
    } catch (logErr) {
      console.warn("Could not write document resubmission activity log:", logErr);
    }

    return NextResponse.json({
      success: true,
      status: nextStatus || application.status,
      remarks: nextRemarks ?? application.remarks,
      // Only the fields the track page renders. publicId is an internal
      // Cloudinary handle and stays server-side, as it does in /api/track.
      documents: result.map((doc) => ({
        id: doc.id,
        type: doc.type,
        secureUrl: doc.secureUrl,
        originalName: doc.originalName,
        isVerified: !!doc.isVerified,
        isRejected: !!doc.isRejected,
        rejectReason: doc.rejectReason || undefined,
      })),
    });
  } catch (error: any) {
    console.error("Document resubmission failed:", error);
    return NextResponse.json(
      { success: false, error: "ระบบไม่สามารถบันทึกเอกสารได้ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
