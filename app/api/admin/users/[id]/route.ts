import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === "admin-default") {
      return NextResponse.json(
        { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Check user email before deleting to protect default admin
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "ไม่พบบัญชีผู้ดูแลที่ต้องการลบ" },
        { status: 404 }
      );
    }

    if (targetUser.email === "admin@tif.ac.th") {
      return NextResponse.json(
        { error: "ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin@tif.ac.th) ได้" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการลบบัญชีผู้ดูแล" },
      { status: 500 }
    );
  }
}
