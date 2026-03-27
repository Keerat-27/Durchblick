import type { CookieOptions, Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createUser, findUserByEmail, findUserById } from './users-store.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type TokenConfig,
} from './jwt-tokens.js';
import type { PublicUser } from './types.js';

const REFRESH_COOKIE = 'refresh_token';

const registerBody = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginBody = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

function toPublicUser(u: { id: string; email: string }): PublicUser {
  return { id: u.id, email: u.email };
}

function refreshCookieOptions(maxAgeMs: number, secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: maxAgeMs,
  };
}

export function createAuthRouter(cfg: TokenConfig, clientOrigin: string): Router {
  const router = createRouter();
  const secureCookies = process.env.NODE_ENV === 'production';
  const refreshMaxAgeMs = cfg.refreshDays * 24 * 60 * 60 * 1000;

  const revokedRefreshJti = new Set<string>();

  function setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, refreshCookieOptions(refreshMaxAgeMs, secureCookies));
  }

  function clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      path: '/api/auth',
    });
  }

  function issueTokens(res: Response, userId: string) {
    const accessToken = signAccessToken(userId, cfg);
    const { token: refreshToken } = signRefreshToken(userId, cfg);
    setRefreshCookie(res, refreshToken);
    return {
      accessToken,
      expiresInSeconds: cfg.accessMinutes * 60,
    };
  }

  router.post('/register', async (req: Request, res: Response) => {
    const parsed = registerBody.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first =
        Object.values(msg).flat()[0] ?? 'Invalid request';
      res.status(400).json({ error: first });
      return;
    }
    const { email, password } = parsed.data;
    if (findUserByEmail(email)) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    try {
      const hash = await bcrypt.hash(password, 12);
      const user = createUser(email, hash);
      const { accessToken, expiresInSeconds } = issueTokens(res, user.id);
      res.status(201).json({
        user: toPublicUser(user),
        accessToken,
        expiresIn: expiresInSeconds,
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'EMAIL_TAKEN') {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
      }
      throw e;
    }
  });

  router.post('/login', async (req: Request, res: Response) => {
    const parsed = loginBody.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first = Object.values(msg).flat()[0] ?? 'Invalid request';
      res.status(400).json({ error: first });
      return;
    }
    const { email, password } = parsed.data;
    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const { accessToken, expiresInSeconds } = issueTokens(res, user.id);
    res.json({
      user: toPublicUser(user),
      accessToken,
      expiresIn: expiresInSeconds,
    });
  });

  router.post('/logout', (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) {
      try {
        const payload = verifyRefreshToken(token, cfg.refreshSecret);
        revokedRefreshJti.add(payload.jti);
      } catch {
        /* ignore */
      }
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  });

  router.post('/refresh', (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      res.status(401).json({ error: 'No refresh session' });
      return;
    }
    let payload;
    try {
      payload = verifyRefreshToken(token, cfg.refreshSecret);
    } catch {
      clearRefreshCookie(res);
      res.status(401).json({ error: 'Session expired' });
      return;
    }
    if (revokedRefreshJti.has(payload.jti)) {
      clearRefreshCookie(res);
      res.status(401).json({ error: 'Session revoked' });
      return;
    }
    const user = findUserById(payload.sub);
    if (!user) {
      clearRefreshCookie(res);
      res.status(401).json({ error: 'User not found' });
      return;
    }
    revokedRefreshJti.add(payload.jti);
    const accessToken = signAccessToken(user.id, cfg);
    const { token: newRefresh } = signRefreshToken(user.id, cfg);
    setRefreshCookie(res, newRefresh);
    res.json({
      user: toPublicUser(user),
      accessToken,
      expiresIn: cfg.accessMinutes * 60,
    });
  });

  router.get('/me', (req: Request, res: Response) => {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!bearer) {
      res.status(401).json({ error: 'Missing access token' });
      return;
    }
    let sub: string;
    try {
      const decoded = verifyAccessToken(bearer, cfg.accessSecret);
      sub = decoded.sub;
    } catch {
      res.status(401).json({ error: 'Invalid or expired access token' });
      return;
    }
    const user = findUserById(sub);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.json({ user: toPublicUser(user) });
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, clientOrigin });
  });

  return router;
}
