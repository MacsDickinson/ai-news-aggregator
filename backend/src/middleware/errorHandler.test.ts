import type { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { errorHandler, ValidationError } from "./errorHandler";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    originalUrl: "/test",
    method: "GET",
    ip: "127.0.0.1",
    get: (name: string) =>
      name.toLowerCase() === "user-agent" ? "vitest" : null,
    ...overrides,
  } as unknown as Request;
}

function createMockRes() {
  const statusMock = vi.fn();
  const jsonMock = vi.fn();
  const res = {
    status: (code: number) => {
      statusMock(code);
      return res;
    },
    json: (body: unknown) => {
      jsonMock(body);
      return res;
    },
  } as unknown as Response & {
    _status: typeof statusMock;
    _json: typeof jsonMock;
  };
  // Expose spies for assertions
  (res as any)._status = statusMock;
  (res as any)._json = jsonMock;
  return res;
}

describe("errorHandler middleware", () => {
  const nodeEnvOriginal = process.env.NODE_ENV;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnvOriginal;
  });

  it("returns 400 with details for Zod validation errors", () => {
    const schema = z.object({ id: z.string().uuid() });
    let caughtError: unknown;
    try {
      schema.parse({ id: "not-a-uuid" });
    } catch (e) {
      caughtError = e;
    }
    const req = createMockReq();
    const res = createMockRes();

    // @ts-expect-error - next is unused in errorHandler
    errorHandler(caughtError as Error, req, res, vi.fn());

    expect((res as any)._status).toHaveBeenCalledWith(400);
    const jsonArg = (res as any)._json.mock.calls[0][0] as any;
    expect(jsonArg.error).toBe("Validation Error");
    expect(jsonArg.details).toBeTruthy();
    expect(Array.isArray(jsonArg.details)).toBe(true);
  });

  it("returns operational error status and message", () => {
    const err = new ValidationError("Bad input");
    const req = createMockReq();
    const res = createMockRes();

    // @ts-expect-error - next is unused in errorHandler
    errorHandler(err, req, res, vi.fn());

    expect((res as any)._status).toHaveBeenCalledWith(400);
    const jsonArg = (res as any)._json.mock.calls[0][0] as any;
    expect(jsonArg.error).toBe("ValidationError");
    expect(jsonArg.message).toBe("Bad input");
  });

  it("masks non-operational errors in production", () => {
    process.env.NODE_ENV = "production";
    const err = new Error("Boom");
    const req = createMockReq();
    const res = createMockRes();

    // @ts-expect-error - next is unused in errorHandler
    errorHandler(err, req, res, vi.fn());

    expect((res as any)._status).toHaveBeenCalledWith(500);
    const jsonArg = (res as any)._json.mock.calls[0][0] as any;
    expect(jsonArg.error).toBe("Internal Server Error");
    expect(jsonArg.message).toBe("Something went wrong");
    expect(jsonArg.stack).toBeUndefined();
  });

  it("includes error details in non-production", () => {
    process.env.NODE_ENV = "test";
    const err = new Error("Boom");
    const req = createMockReq();
    const res = createMockRes();

    // @ts-expect-error - next is unused in errorHandler
    errorHandler(err, req, res, vi.fn());

    expect((res as any)._status).toHaveBeenCalledWith(500);
    const jsonArg = (res as any)._json.mock.calls[0][0] as any;
    expect(jsonArg.error).toBe("Internal Server Error");
    expect(jsonArg.message).toBe("Boom");
    expect(typeof jsonArg.stack).toBe("string");
  });
});
