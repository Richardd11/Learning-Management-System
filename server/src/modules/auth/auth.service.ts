import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { generateTokens, verifyRefreshToken } from "../../lib/jwt.js";
import { redis } from "../../lib/redis.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";
import type { TokenPair, JwtPayload } from "../../types/index.js";
import type { User, Role } from "@prisma/client";

/**
 * Admin-only user creation.
 * Self-registration is disabled — all accounts must be created by an admin.
 */
export async function register(input: RegisterInput): Promise<{ user: User; tokens: TokenPair }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  // Validate academicLevel and section if provided
  if (input.academicLevelId) {
    const level = await prisma.academicLevel.findUnique({ where: { id: input.academicLevelId } });
    if (!level) throw new Error("Invalid academic level ID");
  }
  if (input.sectionId) {
    const section = await prisma.section.findUnique({ where: { id: input.sectionId } });
    if (!section) throw new Error("Invalid section ID");
    // Ensure section belongs to the specified academic level
    if (input.academicLevelId && section.academicLevelId !== input.academicLevelId) {
      throw new Error("Section does not belong to the specified academic level");
    }
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role ?? "STUDENT",
      academicLevelId: input.academicLevelId ?? null,
      sectionId: input.sectionId ?? null,
      studentIdNumber: input.studentIdNumber ?? null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
    },
    include: {
      academicLevel: true,
      section: true,
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
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      academicLevel: true,
      section: true,
    },
  });
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
    // OAuth users are created as STUDENT by default — admin can upgrade later
    user = await prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        role: "STUDENT",
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
