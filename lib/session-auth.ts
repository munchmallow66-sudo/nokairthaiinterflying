import { SignJWT, jwtVerify } from "jose";

function getJwtSecret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      id: (payload.id as string) || "admin-default",
      email: (payload.email as string) || "",
      name: (payload.name as string) || "Academy Administrator",
      role: (payload.role as string) || "ADMIN",
    };
  } catch {
    return null;
  }
}