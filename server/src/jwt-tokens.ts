import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { AccessPayload, RefreshPayload } from './types.js';

export type TokenConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessMinutes: number;
  refreshDays: number;
};

export function signAccessToken(userId: string, cfg: TokenConfig): string {
  const payload: AccessPayload = { sub: userId, type: 'access' };
  return jwt.sign(payload, cfg.accessSecret, {
    expiresIn: `${cfg.accessMinutes}m`,
  });
}

export function signRefreshToken(userId: string, cfg: TokenConfig): {
  token: string;
  jti: string;
} {
  const jti = randomUUID();
  const payload: RefreshPayload = { sub: userId, type: 'refresh', jti };
  const token = jwt.sign(payload, cfg.refreshSecret, {
    expiresIn: `${cfg.refreshDays}d`,
  });
  return { token, jti };
}

export function verifyAccessToken(
  token: string,
  accessSecret: string
): AccessPayload {
  const decoded = jwt.verify(token, accessSecret) as AccessPayload;
  if (decoded.type !== 'access') {
    throw new Error('INVALID_TOKEN_TYPE');
  }
  return decoded;
}

export function verifyRefreshToken(
  token: string,
  refreshSecret: string
): RefreshPayload {
  const decoded = jwt.verify(token, refreshSecret) as RefreshPayload;
  if (decoded.type !== 'refresh' || !decoded.jti) {
    throw new Error('INVALID_TOKEN_TYPE');
  }
  return decoded;
}
