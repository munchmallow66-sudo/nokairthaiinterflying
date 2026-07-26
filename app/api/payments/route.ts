import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory persistent payments store (for live demo and real API sync)
let paymentsStore: any[] = [
  {
    id: "pay-1",
    appNum: "TIF-2026-8812",
    student: "Somchai Jaidee (สมชาย ใจดี)",
    feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
    amount: 1500,
    invoiceNo: "INV-2026-0091",
    receiptNo: "RCT-2026-0091",
    status: "VERIFIED",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
    date: "2026-07-24",
  },
  {
    id: "pay-2",
    appNum: "TIF-2026-4401",
    student: "Kanchana Sukhumvit (กาญจนา สุขุมวิท)",
    feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
    amount: 1500,
    invoiceNo: "INV-2026-0092",
    receiptNo: null,
    status: "PENDING",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
    date: "2026-07-24",
  },
];

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

    if (dbPayments && dbPayments.length > 0) {
      const mapped = dbPayments.map((p: any) => ({
        id: p.id,
        appNum: p.application?.applicationNumber || "TIF-2026-XXXX",
        student: p.application?.student ? `${p.application.student.firstNameTh} ${p.application.student.lastNameTh}` : "ผู้สมัครศิษย์บิน",
        feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
        amount: Number(p.amount) || 1500,
        invoiceNo: p.invoiceNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        receiptNo: p.receiptNumber || null,
        status: p.status === "VERIFIED" || p.status === "APPROVED" ? "VERIFIED" : "PENDING",
        slipUrl: p.receiptUrl || p.slipUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
        date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "2026-07-24",
      }));
      return NextResponse.json([...mapped, ...paymentsStore]);
    }
  } catch (err) {
    console.warn("DB payment fetch fallback:", err);
  }

  return NextResponse.json(paymentsStore);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appNum, studentName, slipUrl, amount } = body;

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
      student: studentName || "ผู้สมัครศิษย์บิน",
      feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
      amount: amount || 1500,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNo: null,
      status: "PENDING",
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
            status: "PENDING",
          } as any,
        });
      }
    } catch (e) {
      console.warn("DB payment insert warning:", e);
    }

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to upload payment slip" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    paymentsStore = paymentsStore.map((p) =>
      p.id === id
        ? {
            ...p,
            status: status || "VERIFIED",
            receiptNo: status === "VERIFIED" ? `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}` : p.receiptNo,
          }
        : p
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
