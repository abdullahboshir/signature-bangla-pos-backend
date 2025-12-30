// src/core/utils/logger.ts

import appConfig from "@shared/config/app.config.ts";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = appConfig.NODE_ENV === 'production';

const LEVEL_VALUE: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_LEVEL: LogLevel = isProd ? 'info' : 'debug';

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BRIGHT = '\x1b[1m';

/**
 * Extract caller information from stack trace at CALL TIME
 * This must be called INSIDE the logging function, not during initialization
 */
function getCallerInfo(): { file: string; line: string; full: string } {
  try {
    // Prepare stack trace
    const oldPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_err, stack) => stack;

    const err = new Error();
    const stack = err.stack as any;

    Error.prepareStackTrace = oldPrepareStackTrace;

    if (!Array.isArray(stack)) {
      return { file: 'unknown', line: '0', full: '[unknown:0]' };
    }

    // Skip frames:
    // 0: getCallerInfo
    // 1: logAtLevel (our internal function)
    // 2: log.info/warn/error/debug (user call)
    // 3+: ACTUAL USER CODE ← We want this

    for (let i = 3; i < stack.length; i++) {
      const frame = stack[i];

      // Skip logger internals
      const filename = frame.getFileName() || '';
      if (filename.includes('logger.ts') || filename.includes('/core/utils/')) {
        continue;
      }

      // Skip node_modules and internal Node stuff
      if (filename.includes('node_modules') || filename === 'internal') {
        continue;
      }

      // const functionName = frame.getFunctionName() || 'anonymous'; // Unused
      const lineNumber = frame.getLineNumber() || 0;
      const columnNumber = frame.getColumnNumber() || 0;

      if (filename) {
        // Convert absolute path to relative
        const projectRoot = process.cwd();
        const relativePath = filename
          .replace(projectRoot, '')
          .replace(/^[/\\]/, '')
          .replace(/\\/g, '/');

        // Take last 3-4 segments for readability
        const segments = relativePath.split('/');
        const shortPath = segments.length > 3
          ? `.../${segments.slice(-3).join('/')}`
          : relativePath;

        return {
          file: shortPath,
          line: String(lineNumber),
          full: `${shortPath}:${lineNumber}:${columnNumber}`,
        };
      }
    }
  } catch (e) {
    // Silent fail
  }

  return {
    file: 'unknown',
    line: '0',
    full: 'unknown:0:0',
  };
}

/**
 * Sanitize sensitive data in logs (production only)
 */
function sanitizeSensitive(data: any): any {
  if (!isProd) return data;
  if (data == null || typeof data !== 'object') return data;

  const clone = Array.isArray(data) ? [] : {};
  const sensitiveKeys = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'authorization',
    'cookie',
  ];

  for (const key in data) {
    const val = (data as any)[key];
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      (clone as any)[key] = '***REDACTED***';
    } else if (typeof val === 'object' && val !== null) {
      (clone as any)[key] = sanitizeSensitive(val);
    } else {
      (clone as any)[key] = val;
    }
  }
  return clone;
}

/**
 * Core logging function - captures stack at CALL TIME
 */
function logAtLevel(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  const currentLevelValue = LEVEL_VALUE[DEFAULT_LEVEL];
  const thisLevelValue = LEVEL_VALUE[level];

  // Skip if below threshold
  if (thisLevelValue < currentLevelValue) {
    return;
  }

  // CAPTURE STACK TRACE HERE (at call time)
  const callerInfo = getCallerInfo();
  const timestamp = new Date().toISOString();
  const sanitizedMeta = sanitizeSensitive(meta || {});

  if (isProd) {
    // ============ PRODUCTION: JSON format ============
    const payload = {
      timestamp,
      level: level.toUpperCase(),
      location: callerInfo.full,
      message: msg,
      ...(Object.keys(sanitizedMeta).length > 0 && { meta: sanitizedMeta }),
    };
    console.log(JSON.stringify(payload));
  } else {
    // ============ DEVELOPMENT: Colored format ============
    const color = COLORS[level];
    const levelTag = `${color}${BRIGHT}${level.toUpperCase().padEnd(5)}${RESET}`;
    const timeTag = `${DIM}${timestamp}${RESET}`;
    const fileTag = `${BRIGHT}[${callerInfo.full}]${RESET}`;

    let metaString = '';
    if (Object.keys(sanitizedMeta).length > 0) {
      metaString = '\n' + JSON.stringify(sanitizedMeta, null, 2);
    }

    const logLine = `${timeTag} ${levelTag} ${fileTag}\n  → ${msg}${metaString}`;

    if (level === 'error') {
      console.error(logLine);
    } else if (level === 'warn') {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }
  }
}

/**
 * Export logger with methods
 * Each method calls logAtLevel DIRECTLY (not through a factory)
 * This ensures stack trace is captured at the right depth
 */
export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => logAtLevel('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => logAtLevel('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => logAtLevel('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => logAtLevel('error', msg, meta),
};

export default log;