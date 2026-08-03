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
    const { appNum, student, studentName, feeType, amount, status, slipUrl, invoiceNo, receiptNo } = body;

    let finalSlipUrl = slipUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500";

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
          }
        }
      } catch (cErr) {
        console.warn("Cloudinary slip upload fallback:", cErr);
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

    // Save to DB if Prisma model exists
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
      }
    } catch (e) {
      console.warn("DB payment insert warning:", e);
    }

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create payment record" }, { status: 500 });
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
