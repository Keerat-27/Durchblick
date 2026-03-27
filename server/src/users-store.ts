import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { StoredUser } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');

function ensureDataFile(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(USERS_FILE)) {
    writeFileSync(USERS_FILE, '[]', 'utf8');
  }
}

function readUsers(): StoredUser[] {
  ensureDataFile();
  const raw = readFileSync(USERS_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  ensureDataFile();
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((u) => u.email === normalized);
}

export function findUserById(id: string): StoredUser | undefined {
  return readUsers().find((u) => u.id === id);
}

export function createUser(email: string, passwordHash: string): StoredUser {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error('EMAIL_TAKEN');
  }
  const user: StoredUser = {
    id: randomUUID(),
    email: normalized,
    passwordHash,
  };
  users.push(user);
  writeUsers(users);
  return user;
}
