import bcrypt from "bcryptjs";

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

  try {
    return await bcrypt.compare(password, storedHashOrPass);
  } catch (err) {
    return false;
  }
}
