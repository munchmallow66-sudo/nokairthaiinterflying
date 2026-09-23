import { NextResponse } from "next/server";
import { getAnnouncementsStore } from "@/lib/announcements-store";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true" || searchParams.get("admin") === "true";
    if (includeAll && !(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const responseOptions: ResponseInit = includeAll
      ? { headers: { "Cache-Control": "private, no-store" } }
      : {
          headers: {
            "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
            "Vercel-CDN-Cache-Control": "public, max-age=60",
          },
        };

    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      const dbItems = await (prisma as any).announcement.findMany({
        where: includeAll ? {} : { isActive: true },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        ...(includeAll ? {} : { take: 12 }),
      });

      if (Array.isArray(dbItems)) {
        return NextResponse.json({ success: true, announcements: dbItems }, responseOptions);
      }
    } catch (dbErr) {
      console.warn("DB announcements fetch notice (using memory store fallback):", dbErr);
    }

    const announcementsStore = getAnnouncementsStore();
    // Fallback in-memory filter
    const items = includeAll
      ? announcementsStore
      : announcementsStore.filter((item: any) => item.isActive);

    // Sort by priority desc, createdAt desc
    items.sort((a: any, b: any) => (b.priority - a.priority) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, announcements: items }, responseOptions);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      title,
      content,
      imageUrl,
      imagePublicId,
      linkUrl,
      badge,
      type = "TEXT",
      isActive = true,
      priority = 0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const newItem = {
      id: `anc-${Date.now()}`,
      title: title.trim(),
      content: content ? content.trim() : null,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      linkUrl: linkUrl ? linkUrl.trim() : null,
      badge: badge ? badge.trim() : null,
      type: type || "TEXT",
      isActive: Boolean(isActive),
      priority: Number(priority) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attempt DB create
    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();
      const dbCreated = await (prisma as any).announcement.create({
        data: {
          title: newItem.title,
          content: newItem.content,
          imageUrl: newItem.imageUrl,
          imagePublicId: newItem.imagePublicId,
          linkUrl: newItem.linkUrl,
          badge: newItem.badge,
          type: newItem.type as any,
          isActive: newItem.isActive,
          priority: newItem.priority,
        },
      });
      newItem.id = dbCreated.id;
    } catch (dbErr) {
      console.warn("DB announcements create notice (saving to memory store):", dbErr);
    }

    // Always update in-memory store
    const announcementsStore = getAnnouncementsStore();
    announcementsStore.unshift(newItem);

    return NextResponse.json({ success: true, announcement: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create announcement" },
      { status: 500 }
    );
  }
}

