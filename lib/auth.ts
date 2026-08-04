import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tif-academy-secret-key-2026-secure-jwt-token"
);

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Sign a JWT session token for Admin users
 */
export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an Admin JWT session token
 */
export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: (payload.id as string) || "admin-default",
      email: (payload.email as string) || "",
      name: (payload.name as string) || "Academy Administrator",
      role: (payload.role as string) || "ADMIN",
    };
  } catch (err) {
    return null;
  }
}

/**
 * Hash plaintext password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Verify plaintext password against a bcrypt hash or fallback string
 */
export async function verifyPassword(password: string, storedHashOrPass: string): Promise<boolean> {
  if (!storedHashOrPass) return false;

  // Direct match fallback for default system admin password
  if (password === storedHashOrPass) {
    return true;
  }

  try {
    return await bcrypt.compare(password, storedHashOrPass);
  } catch (err) {
    return false;
  }
}
