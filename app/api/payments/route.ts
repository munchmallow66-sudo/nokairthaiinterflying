import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let paymentsStore: any[] = [];

export async function GET() {
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
                  ? ` | ลงทะเบียนเข้าร่วมงาน Open House วันที่ 12 ก.ย. 2569${
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
