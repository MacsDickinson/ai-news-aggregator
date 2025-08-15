import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedRequest, authMiddleware, optionalAuth } from "./auth";
import { UnauthorizedError } from "./errorHandler";

function createReq(headers: Record<string, string> = {}): AuthenticatedRequest {
  return {
    header: (name: string) =>
      headers[name] ?? headers[name.toLowerCase()] ?? undefined,
  } as unknown as AuthenticatedRequest;
}

function createRes(): Response {
  return {} as Response;
}

function createNext() {
  return vi.fn() as NextFunction;
}

describe("auth middleware", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("throws UnauthorizedError when no token provided", () => {
    const req = createReq();
    const res = createRes();
    const next = createNext();

    expect(() => authMiddleware(req, res, next)).toThrow(UnauthorizedError);
  });

  it("sets req.user for valid token", () => {
    const payload = { userId: "123", email: "test@example.com" };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    const req = createReq({ Authorization: `Bearer ${token}` });
    const res = createRes();
    const next = createNext();

    authMiddleware(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });

  it("throws UnauthorizedError for invalid token", () => {
    const req = createReq({ Authorization: "Bearer invalid" });
    const res = createRes();
    const next = createNext();

    expect(() => authMiddleware(req, res, next)).toThrow(UnauthorizedError);
  });

  it("optionalAuth calls next if no token", () => {
    const req = createReq();
    const res = createRes();
    const next = createNext();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("optionalAuth sets user when token is valid", () => {
    const payload = { userId: "abc", email: "t@example.com" };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);
    const req = createReq({ Authorization: `Bearer ${token}` });
    const res = createRes();
    const next = createNext();

    optionalAuth(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });

  it("optionalAuth ignores invalid token and continues", () => {
    const req = createReq({ Authorization: "Bearer invalid" });
    const res = createRes();
    const next = createNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });
});
