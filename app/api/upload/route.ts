import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { message: "File uploads now use signed direct-to-Cloudinary uploads via /api/upload/signature." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  void req;
  return NextResponse.json(
    { error: "Proxy uploads are disabled. Request a signed direct upload instead." },
    { status: 410 }
  );
}
