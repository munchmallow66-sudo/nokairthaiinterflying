import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/session-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token || !(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [
      totalApplications,
      todayApplications,
      genderRows,
      verifiedPayments,
      pendingPayments,
      upcomingInterviews,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: { createdAt: { gte: startOfToday, lt: startOfTomorrow } },
      }),
      prisma.student.groupBy({ by: ["gender"], _count: { _all: true } }),
      prisma.payment.aggregate({
        where: { status: "VERIFIED" },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.application.count({
        where: {
          OR: [
            { status: "INTERVIEW_SCHEDULED" },
            { interviews: { some: { passed: null } } },
          ],
        },
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          createdAt: true,
          student: {
            select: {
              firstNameTh: true,
              lastNameTh: true,
              firstNameEn: true,
              lastNameEn: true,
            },
          },
        },
      }),
    ]);

    const genders = { male: 0, female: 0, unspecified: 0 };
    for (const row of genderRows) {
      const value = (row.gender || "").trim().toLowerCase();
      const count = row._count._all;
      if (["male", "m", "ชาย", "ผู้ชาย"].includes(value)) genders.male += count;
      else if (["female", "f", "หญิง", "ผู้หญิง"].includes(value)) genders.female += count;
      else genders.unspecified += count;
    }

    return NextResponse.json({
      totalApplications,
      todayApplications,
      genders,
      verifiedPaymentCount: verifiedPayments._count._all,
      totalRevenue: verifiedPayments._sum.amount || 0,
      pendingPayments,
      upcomingInterviews,
      recentApplications,
    });
  } catch (error) {
    console.error("Dashboard statistics fetch failed:", error);
    return NextResponse.json({ error: "Failed to load dashboard statistics" }, { status: 500 });
  }
}