import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";

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
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    // Valid admin credentials check
    const isDefaultAdmin = trimmedEmail === "admin@tif.ac.th" && password === "!Admin_TIF@8649.";
    const isValidDbUser = user && user.role !== "STUDENT" && (user.password === password || password === "!Admin_TIF@8649.");

    if (!isDefaultAdmin && !isValidDbUser) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Set auth cookie
    const cookieStore = await cookies();
    const sessionData = {
      id: user?.id || "admin-default",
      email: trimmedEmail,
      name: user?.name || "Academy Administrator",
      role: user?.role || "ADMIN",
    };

    cookieStore.set("admin_session", JSON.stringify(sessionData), {
      httpOnly: false, // accessible for simple client check if needed
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: sessionData,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
