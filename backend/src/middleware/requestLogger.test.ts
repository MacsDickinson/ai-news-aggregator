import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requestLogger } from "./requestLogger";

function createReq(): Request {
  return {
    method: "GET",
    originalUrl: "/test",
    ip: "127.0.0.1",
    get: (name: string) =>
      name.toLowerCase() === "user-agent" ? "vitest" : null,
    connection: { remoteAddress: "127.0.0.1" },
  } as unknown as Request;
}

function createRes(status = 200) {
  const listeners: Array<() => void> = [];
  const on = vi.fn((event: string, cb: () => void) => {
    if (event === "finish") listeners.push(cb);
    return res;
  });
  const res = {
    statusCode: status,
    on,
  } as unknown as Response & { _emitFinish: () => void };
  (res as any)._emitFinish = () => listeners.forEach((fn) => fn());
  return res;
}

function createNext(): NextFunction {
  return vi.fn();
}

describe("requestLogger middleware", () => {
  it("calls next and logs on finish with INFO for 2xx", () => {
    const req = createReq();
    const res = createRes(200);
    const next = createNext();

    const infoSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
    (res as any)._emitFinish();

    expect(infoSpy).toHaveBeenCalled();
  });

  it("logs WARN for 4xx", () => {
    const req = createReq();
    const res = createRes(404);
    const next = createNext();

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    requestLogger(req, res, next);
    (res as any)._emitFinish();

    expect(warnSpy).toHaveBeenCalled();
  });

  it("logs ERROR for 5xx", () => {
    const req = createReq();
    const res = createRes(500);
    const next = createNext();

    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    requestLogger(req, res, next);
    (res as any)._emitFinish();

    expect(errorSpy).toHaveBeenCalled();
  });
});
