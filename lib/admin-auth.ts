import { cookies } from "next/headers";
import { verifyAdminSessionToken, type AdminSessionPayload } from "@/lib/session-auth";

/** Resolve the signed admin session inside Route Handlers. */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  return token ? verifyAdminSessionToken(token) : null;
}

export async function isAdminRequest(): Promise<boolean> {
  return Boolean(await getAdminSession());
}