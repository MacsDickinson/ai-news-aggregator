export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function getNowIso(): string {
  try {
    return new Date().toISOString();
  } catch {
    return '' + Date.now();
  }
}

function resolveLogLevel(): LogLevel {
  // Try process.env if available (Node)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyGlobal: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const envLevel: string | undefined = anyGlobal?.process?.env?.LOG_LEVEL;

  // Try localStorage if available (Browser)
  let storedLevel: string | null = null;
  try {
    const localStorageRef: unknown =
      typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: unknown }).localStorage
        ? (globalThis as unknown as { localStorage?: { getItem: (key: string) => string | null } }).localStorage
        : null;
    storedLevel = localStorageRef ? (localStorageRef as { getItem: (key: string) => string | null }).getItem('LOG_LEVEL') : null;
  } catch {
    // ignore
  }

  const level = (envLevel || storedLevel || 'INFO').toUpperCase();
  if (level === 'DEBUG' || level === 'INFO' || level === 'WARN' || level === 'ERROR') return level;
  return 'INFO';
}

function shouldLog(current: LogLevel, target: LogLevel): boolean {
  const order: Record<LogLevel, number> = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
  return order[target] >= order[current];
}

export interface Logger {
  debug: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

export function createLogger(appName: 'backend' | 'frontend' | string): Logger {
  const minLevel = resolveLogLevel();

  function log(level: LogLevel, message: string, meta?: unknown): void {
    if (!shouldLog(minLevel, level)) return;
    const prefix = `${getNowIso()} [${appName}] [${level}]`;
    if (meta !== undefined) {
      // eslint-disable-next-line no-console
      (level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log)(
        `${prefix} ${message}`,
        meta
      );
    } else {
      // eslint-disable-next-line no-console
      (level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log)(
        `${prefix} ${message}`
      );
    }
  }

  return {
    debug: (message, meta) => log('DEBUG', message, meta),
    info: (message, meta) => log('INFO', message, meta),
    warn: (message, meta) => log('WARN', message, meta),
    error: (message, meta) => log('ERROR', message, meta),
  };
}


