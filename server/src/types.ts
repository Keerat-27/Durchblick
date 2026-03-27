export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
};

export type PublicUser = {
  id: string;
  email: string;
};

export type AccessPayload = {
  sub: string;
  type: 'access';
};

export type RefreshPayload = {
  sub: string;
  type: 'refresh';
  jti: string;
};
