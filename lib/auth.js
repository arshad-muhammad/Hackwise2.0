import { SignJWT, jwtVerify } from 'jose';

const ADMIN_KEY = 'noor';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'hackwise-secure-secret-key-change-me');

export async function verifyAdminKey(key) {
  return key === ADMIN_KEY;
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  return token;
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'admin';
  } catch (err) {
    return false;
  }
}

export async function createTeamSession(teamData) {
  const token = await new SignJWT({ ...teamData, role: 'team' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  return token;
}

export async function verifyTeamSession(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'team' ? payload : null;
  } catch (err) {
    return null;
  }
}
