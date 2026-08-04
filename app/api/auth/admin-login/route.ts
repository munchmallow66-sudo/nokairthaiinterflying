import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { createAdminSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const prisma = getPrisma();

    // Check user in database
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    // Default admin fallback credentials check
    const isDefaultAdmin =
      trimmedEmail === "admin@tif.ac.th" && password === "!Admin_TIF@8649.";

    let isValidUser = false;
    if (isDefaultAdmin) {
      isValidUser = true;
    } else if (user && user.role !== "STUDENT" && user.password) {
      isValidUser = await verifyPassword(password, user.password);
    }

    if (!isValidUser) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user?.id || "admin-default",
      email: trimmedEmail,
      name: user?.name || "Academy Administrator",
      role: user?.role || "ADMIN",
    };

    // Generate signed JWT token
    const token = await createAdminSessionToken(sessionPayload);

    // Set secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true, // Prevents XSS theft
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
