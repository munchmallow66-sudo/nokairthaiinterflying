import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const prisma = getPrisma();

    // Fetch non-STUDENT users
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN", "HR", "FINANCE", "TRAINING_OFFICER", "SALES"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if default admin exists in the returned list
    const hasDefaultAdmin = users.some((u) => u.email === "admin@tif.ac.th");
    const result = [...users];

    if (!hasDefaultAdmin) {
      result.unshift({
        id: "admin-default",
        name: "Academy System Administrator",
        email: "admin@tif.ac.th",
        role: "SUPER_ADMIN",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });
    }

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    // Fallback default admin list if DB fails or empty
    return NextResponse.json({
      users: [
        {
          id: "admin-default",
          name: "Academy System Administrator",
          email: "admin@tif.ac.th",
          role: "SUPER_ADMIN",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูล ชื่อ, อีเมล และ รหัสผ่าน ให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const prisma = getPrisma();

    // Check if a staff/admin account with this email already exists — scoped to
    // non-student roles only, since email is no longer globally unique.
    const existing = await prisma.user.findFirst({
      where: { email: trimmedEmail, role: { notIn: ["STUDENT", "GUEST"] } },
    });

    if (existing || trimmedEmail === "admin@tif.ac.th") {
      return NextResponse.json(
        { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: trimmedEmail,
        password: hashedPassword,
        role: role || "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการสร้างบัญชีผู้ดูแล" },
      { status: 500 }
    );
  }
}
