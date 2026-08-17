import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

let paymentsStore: any[] = [];

/**
 * Answers one question for the public slip-upload page: does the applicant
 * behind this application number / national ID / phone already have a payment
 * slip on file?
 *
 * The page used to work this out from the full payment list, which carries no
 * national ID, so an applicant who searched by ID was never matched and was
 * shown the upload form a second time. Resolving it here — against the same
 * payments table /api/track trusts — is the only way the answer survives a
 * refresh or a different device.
 *
 * Deliberately narrow: it returns the resolved application number and a
 * yes/no, never the applicant's name or any other personal field, and it is
 * rate limited because it takes an unauthenticated identifier.
 */
async function lookupSlipStatus(req: Request, rawQuery: string) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`slip_check_${ip}`, 20, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `คุณส่งคำขอตรวจสอบถี่เกินไป กรุณารออีก ${rateCheck.resetInSeconds} วินาที` },
      { status: 429 }
    );
  }

  const trimmed = rawQuery.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (!trimmed) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  try {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();

    let application: any = null;

    if (trimmed.toUpperCase().startsWith("TIF")) {
      application = await prisma.application.findFirst({
        where: { applicationNumber: { equals: trimmed, mode: "insensitive" } },
        include: { payments: { orderBy: { createdAt: "desc" } } },
      });
    }

    if (!application && digits.length > 0) {
      const student = await prisma.student.findFirst({
        where: { OR: [{ nationalId: digits }, { phone: digits }] },
        include: {
          applications: {
            include: { payments: { orderBy: { createdAt: "desc" } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      // An applicant with more than one application is answered with the one
      // that already carries a slip, not simply the newest. Picking the newest
      // blind is what would put the upload form back in front of someone who
      // has paid.
      const studentApps: any[] = student?.applications || [];
      application =
        studentApps.find((a: any) =>
          (a.payments || []).some((p: any) => p.status !== "REJECTED")
        ) ||
        studentApps[0] ||
        null;
    }

    if (!application) {
      return NextResponse.json({ found: false });
    }

    const paymentRows: any[] = Array.isArray(application.payments) ? application.payments : [];
    // A rejected slip does not count — that applicant is meant to send a new one.
    const activePayment = paymentRows.find((p) => p.status !== "REJECTED") || null;

    return NextResponse.json({
      found: true,
      appNum: application.applicationNumber,
      status: application.status,
      hasSlip: !!activePayment,
      paymentStatus: paymentRows[0]?.status || null,
    });
  } catch (err) {
    console.warn("Slip status lookup failed:", err);
    // Undetermined, not "no slip". The caller must not read this as permission
    // to show the upload form again.
    return NextResponse.json({ error: "lookup_failed" }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const slipCheck = new URL(req.url).searchParams.get("slipCheck");
  if (slipCheck !== null) {
    return lookupSlipStatus(req, slipCheck);
  }

  try {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const dbPayments = await prisma.payment.findMany({
      include: {
        application: {
          include: { student: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (Array.isArray(dbPayments) && dbPayments.length > 0) {
      const mapped = dbPayments.map((p: any) => ({
        id: p.id,
        appNum: p.application?.applicationNumber || "TIF-2026-XXXX",
        student: p.application?.student ? `${p.application.student.firstNameTh} ${p.application.student.lastNameTh}` : "ผู้สมัครศิษย์บิน",
        feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,800 บาท",
        amount: Number(p.amount) || 1800,
        invoiceNo: p.invoiceNo || p.invoiceNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        receiptNo: p.receiptNo || p.receiptNumber || null,
        status: p.status === "VERIFIED" || p.status === "APPROVED" ? "VERIFIED" : "PENDING",
        slipUrl: p.slipUrl || p.receiptUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
        date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "2026-07-24",
      }));

      const dbIds = new Set(mapped.map((m: any) => m.id));
      const dbInvoiceNos = new Set(mapped.filter((m: any) => m.invoiceNo).map((m: any) => m.invoiceNo));
      const dbAppNums = new Set(mapped.filter((m: any) => m.appNum).map((m: any) => m.appNum));

      const filteredStore = paymentsStore.filter(
        (p: any) => !dbIds.has(p.id) && !dbInvoiceNos.has(p.invoiceNo) && !dbAppNums.has(p.appNum)
      );

      // Deduplicate combined results by invoiceNo or appNum or id
      const uniqueMap = new Map();
      [...mapped, ...filteredStore].forEach((item: any) => {
        const key = item.invoiceNo || item.appNum || item.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      return NextResponse.json(Array.from(uniqueMap.values()));
    }
  } catch (err) {
    console.warn("DB payment fetch fallback:", err);
  }

  return NextResponse.json(paymentsStore);
}

/** True when the caller is signed in to the admin panel. */
async function isAdminRequest() {
  try {
    const { cookies } = await import("next/headers");
    const { verifyAdminSessionToken } = await import("@/lib/auth");
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    return sessionToken ? !!(await verifyAdminSessionToken(sessionToken)) : false;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      appNum,
      student,
      studentName,
      feeType,
      amount,
      status,
      slipUrl,
      invoiceNo,
      receiptNo,
      joinOpenHouse,
      openHouseAttendees,
    } = body;

    // One slip per application, enforced here rather than only in the page.
    // Hiding the upload button is what an applicant sees; this is what actually
    // stops a second slip — a stale tab, a back button or a double submit all
    // reach this handler with the button long gone. Staff are exempt: the admin
    // panel records payments on an applicant's behalf. A REJECTED slip does not
    // count, so an applicant asked for a new one can still send it.
    const requestedAppNum = (appNum || "").toString().trim();
    if (requestedAppNum && !(await isAdminRequest())) {
      try {
        const { getPrisma } = await import("@/lib/prisma");
        const prisma = getPrisma();
        const existingPayment = await prisma.payment.findFirst({
          where: {
            application: { applicationNumber: { equals: requestedAppNum, mode: "insensitive" } },
            status: { not: "REJECTED" },
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingPayment) {
          return NextResponse.json(
            {
              success: false,
              alreadySubmitted: true,
              error:
                "ระบบได้รับสลิปโอนเงินของใบสมัครนี้เรียบร้อยแล้ว ไม่ต้องแนบสลิปซ้ำอีก กรุณารอเจ้าหน้าที่ตรวจสอบ",
            },
            { status: 409 }
          );
        }
      } catch (dupErr) {
        // Undetermined. Blocking here would stop a first-time payer, so the
        // submission proceeds and staff see any duplicate in the payments list.
        console.warn("Duplicate slip check skipped:", dupErr);
      }
    }

    let finalSlipUrl = slipUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500";
    let cloudinaryOk = true;

    // If slipUrl is a base64 Data URL, attempt uploading to Cloudinary
    if (typeof slipUrl === "string" && slipUrl.startsWith("data:")) {
      try {
        const { uploadToCloudinary } = await import("@/lib/cloudinary");
        const parts = slipUrl.split(",");
        if (parts.length === 2) {
          const buffer = Buffer.from(parts[1], "base64");
          const uploaded = await uploadToCloudinary(buffer, "tif_slips", "image");
          if (uploaded?.url) {
            finalSlipUrl = uploaded.url;
          } else {
            cloudinaryOk = false;
          }
        } else {
          cloudinaryOk = false;
        }
      } catch (cErr) {
        console.warn("Cloudinary slip upload fallback:", cErr);
        cloudinaryOk = false;
      }
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      appNum: appNum || `TIF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      student: student || studentName || "ผู้สมัครศิษย์บิน",
      feeType: feeType || "ค่าสมัครเรียนการบินออนไลน์ 1,800 บาท",
      amount: Number(amount) || 1800,
      invoiceNo: invoiceNo || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNo: receiptNo || (status === "VERIFIED" ? `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}` : null),
      status: status || "PENDING",
      slipUrl: finalSlipUrl,
      date: new Date().toISOString().split("T")[0],
    };

    paymentsStore.unshift(newPayment);

    // Save to DB if Prisma model exists — track real write outcome instead of assuming success
    let dbWriteOk = false;
    let dbError: string | null = null;
    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      const targetApp = await prisma.application.findFirst({
        where: { applicationNumber: newPayment.appNum },
      });
      if (targetApp) {
        await prisma.payment.create({
          data: {
            applicationId: targetApp.id,
            amount: newPayment.amount,
            invoiceNo: newPayment.invoiceNo,
            receiptNo: newPayment.receiptNo,
            slipUrl: newPayment.slipUrl,
            slipPublicId: "tif_slip",
            status: newPayment.status === "VERIFIED" ? "VERIFIED" : "PENDING",
          } as any,
        });
        dbWriteOk = true;

        // The slip used to land in the payments table only, leaving the
        // application row looking exactly as it did before payment — and the
        // applicant's Open House choice was written by a separate PATCH from the
        // browser that could race this request. Record the applicant-supplied
        // facts here, on the application, so a refresh cannot lose them.
        //
        // The workflow status is deliberately NOT advanced for a pending slip:
        // step 5 (APPLICATION_FEE_PAID) means finance approved the transfer, and
        // moving an application there — or to PAYMENT_PENDING, which is not one
        // of the 13 workflow steps the admin panel knows — would misreport the
        // application to staff. The payment row itself is what tells the track
        // page the fee has been paid.
        if (cloudinaryOk) {
          const appUpdate: any = {};

          if (typeof joinOpenHouse === "boolean") {
            appUpdate.joinOpenHouse = joinOpenHouse;
          }

          // Remarks are only safe to overwrite while the application is still
          // waiting on this fee. Past that point the column carries exam
          // results and staff instructions that must not be clobbered.
          const AWAITING_FEE_STATUSES = ["DOCS_PASSED", "DOCUMENT_VERIFIED", "PAYMENT_PENDING"];

          if (AWAITING_FEE_STATUSES.includes(targetApp.status)) {
            const verified = newPayment.status === "VERIFIED";

            const openHouseNote =
              typeof joinOpenHouse === "boolean"
                ? joinOpenHouse
                  ? ` | ลงทะเบียนเข้าร่วมงาน Open House วันที่ 19 ก.ย. 2569${
                      Number(openHouseAttendees) > 0 ? ` (จำนวน ${Number(openHouseAttendees)} ท่าน)` : ""
                    }`
                  : " | ไม่ประสงค์เข้าร่วมงาน Open House"
                : "";

            if (verified) {
              // Staff recorded an already-verified payment (admin "Add slip"),
              // which is the same transition PATCH performs on approval.
              appUpdate.status = "APPLICATION_FEE_PAID";
              appUpdate.remarks = `อนุมัติสลิปการชำระเงิน ${newPayment.amount.toLocaleString(
                "th-TH"
              )} บาทเรียบร้อยแล้ว${openHouseNote}`;
            } else {
              appUpdate.remarks = `ได้รับสลิปโอนเงินเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบและอนุมัติใบสมัครภายใน 24 ชม.${openHouseNote}`;
            }
          }

          if (Object.keys(appUpdate).length > 0) {
            // Kept separate from the payment insert on purpose: the payment row
            // is the durable record /api/track reads to decide whether the fee
            // is still owed, so a failure to advance the application status must
            // not fail a slip the applicant did successfully submit.
            try {
              await prisma.application.update({
                where: { id: targetApp.id },
                data: appUpdate,
              });
            } catch (appErr) {
              console.error(
                "Payment saved but application status update failed:",
                appErr instanceof Error ? appErr.stack : appErr
              );
            }
          }
        }
      } else {
        dbError = `No application found for applicationNumber ${newPayment.appNum}`;
      }
    } catch (e) {
      console.error("DB payment insert error:", e instanceof Error ? e.stack : e);
      dbError = e instanceof Error ? e.message : "Unknown database error while saving payment.";
    }

    const overallOk = dbWriteOk && cloudinaryOk;

    return NextResponse.json(
      {
        success: overallOk,
        payment: newPayment,
        ...(overallOk ? {} : { error: dbError || "Payment slip was not fully processed (upload fallback used)." }),
      },
      { status: overallOk ? 200 : 500 }
    );
  } catch (err: any) {
    console.error("API error creating payment:", err instanceof Error ? err.stack : err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown server error while creating payment.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, appNum, student, amount, status, receiptNo, invoiceNo } = body;

    let updatedItem: any = null;

    paymentsStore = paymentsStore.map((p) => {
      if (p.id === id) {
        const itemStatus = status !== undefined ? status : p.status;
        const itemReceipt = receiptNo !== undefined
          ? receiptNo
          : (itemStatus === "VERIFIED" && !p.receiptNo ? `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}` : p.receiptNo);

        updatedItem = {
          ...p,
          ...(appNum !== undefined && { appNum }),
          ...(student !== undefined && { student }),
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(invoiceNo !== undefined && { invoiceNo }),
          status: itemStatus,
          receiptNo: itemReceipt,
        };
        return updatedItem;
      }
      return p;
    });

    // Try DB update
    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      const updateData: any = {};
      if (status !== undefined) updateData.status = status === "VERIFIED" ? "VERIFIED" : "PENDING";
      if (amount !== undefined) updateData.amount = Number(amount);
      if (receiptNo !== undefined) updateData.receiptNo = receiptNo;

      await prisma.payment.update({
        where: { id },
        data: updateData,
      });

      const targetAppNum = updatedItem?.appNum || appNum;
      if (targetAppNum && (status === "VERIFIED" || status === "APPROVED")) {
        const targetApp = await prisma.application.findFirst({
          where: { applicationNumber: targetAppNum },
        });
        if (targetApp) {
          await prisma.application.update({
            where: { id: targetApp.id },
            data: { status: "APPLICATION_FEE_PAID" },
          });
        }
      }
    } catch (e) {
      console.warn("DB payment update notice:", e);
    }

    return NextResponse.json({ success: true, payment: updatedItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Payment ID is required" }, { status: 400 });
    }

    paymentsStore = paymentsStore.filter((p) => p.id !== id);

    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      await prisma.payment.delete({ where: { id } });
    } catch (e) {
      console.warn("DB payment delete notice:", e);
    }

    return NextResponse.json({ success: true, message: "Payment deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
