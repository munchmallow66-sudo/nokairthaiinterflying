import { NextResponse } from "next/server";
import { getAnnouncementsStore } from "@/lib/announcements-store";

export const dynamic = "force-dynamic";

// GET single announcement by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try Prisma DB first
    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      const dbItem = await (prisma as any).announcement.findUnique({ where: { id } });
      if (dbItem) {
        return NextResponse.json({ success: true, announcement: dbItem });
      }
    } catch (dbErr) {
      console.warn("DB fetch single notice:", dbErr);
    }

    const store = getAnnouncementsStore();
    const found = store.find((item) => item.id === id);
    if (!found) {
      return NextResponse.json({ success: false, error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: found });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update announcement properties or toggle active status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const store = getAnnouncementsStore();
    const index = store.findIndex((item) => item.id === id);

    let updatedItem: any = null;

    if (index !== -1) {
      if (body.title !== undefined) store[index].title = body.title.trim();
      if (body.content !== undefined) store[index].content = body.content ? body.content.trim() : null;
      if (body.imageUrl !== undefined) store[index].imageUrl = body.imageUrl || null;
      if (body.imagePublicId !== undefined) store[index].imagePublicId = body.imagePublicId || null;
      if (body.linkUrl !== undefined) store[index].linkUrl = body.linkUrl ? body.linkUrl.trim() : null;
      if (body.badge !== undefined) store[index].badge = body.badge ? body.badge.trim() : null;
      if (body.type !== undefined) store[index].type = body.type;
      if (body.isActive !== undefined) store[index].isActive = Boolean(body.isActive);
      if (body.priority !== undefined) store[index].priority = Number(body.priority);
      store[index].updatedAt = new Date().toISOString();
      updatedItem = store[index];
    }

    // Attempt DB update
    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title.trim();
      if (body.content !== undefined) updateData.content = body.content ? body.content.trim() : null;
      if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
      if (body.imagePublicId !== undefined) updateData.imagePublicId = body.imagePublicId || null;
      if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl ? body.linkUrl.trim() : null;
      if (body.badge !== undefined) updateData.badge = body.badge ? body.badge.trim() : null;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
      if (body.priority !== undefined) updateData.priority = Number(body.priority);

      const dbUpdated = await (prisma as any).announcement.update({
        where: { id },
        data: updateData,
      });
      updatedItem = dbUpdated;
    } catch (dbErr) {
      console.warn("DB announcement update notice (updated in memory store):", dbErr);
    }

    if (!updatedItem) {
      return NextResponse.json({ success: false, error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove announcement by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = getAnnouncementsStore();
    const index = store.findIndex((item) => item.id === id);

    if (index !== -1) {
      store.splice(index, 1);
    }

    // Attempt DB delete
    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      await (prisma as any).announcement.delete({ where: { id } });
    } catch (dbErr) {
      console.warn("DB announcement delete notice:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
