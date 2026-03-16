import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'sp_session';
const SESSION_DURATION = 8 * 60 * 60; // 8 horas em segundos

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function validateAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  // Comparação direta (sem hash por simplicidade — admin único)
  return password === adminPassword;
}

export async function createSession(): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);
  return token;
}

export async function validateSession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    const secret = getJwtSecret();
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE, SESSION_DURATION };
