import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    // Call internal DELETE logic by delegating to API handler or importing
    const url = new URL(req.url);
    url.pathname = "/api/payments";
    url.searchParams.set("id", id);

    const deleteRes = await fetch(url.toString(), { method: "DELETE" });
    const data = await deleteRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
