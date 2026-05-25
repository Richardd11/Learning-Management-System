import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { generateTokens, verifyRefreshToken } from "../../lib/jwt.js";
import { redis } from "../../lib/redis.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";
import type { TokenPair, JwtPayload } from "../../types/index.js";
import type { User, Role } from "@prisma/client";

export async function register(input: RegisterInput): Promise<{ user: User; tokens: TokenPair }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  });

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, tokens };
}

export async function login(input: LoginInput): Promise<{ user: User; tokens: TokenPair }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user?.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  if (user.isBanned) {
    throw new Error("Account has been suspended");
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken, lastActiveAt: new Date() },
  });

  return { user, tokens };
}

export async function refreshTokens(oldRefreshToken: string): Promise<TokenPair> {
  const payload = verifyRefreshToken(oldRefreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new Error("Invalid refresh token");
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}

export async function logout(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  await redis.del(`session:${userId}`);
}

export async function findOrCreateOAuthUser(profile: {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: "google" | "github";
  providerId: string;
}): Promise<{ user: User; tokens: TokenPair }> {
  const providerField = profile.provider === "google" ? "googleId" : "githubId";

  let user = await prisma.user.findFirst({
    where: { OR: [{ [providerField]: profile.providerId }, { email: profile.email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        [providerField]: profile.providerId,
      },
    });
  } else if (!(user as Record<string, unknown>)[providerField]) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { [providerField]: profile.providerId },
    });
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, tokens };
}

export function sanitizeUser(user: User) {
  const { passwordHash, refreshToken, ...safe } = user;
  return safe;
}
