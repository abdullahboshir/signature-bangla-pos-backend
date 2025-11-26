import appConfig from "@shared/config/app.config.ts";




type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = appConfig.NODE_ENV === 'production';

const LEVEL_VALUE: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
};


const DEFAULT_LEVEL: LogLevel = isProd ? 'info' : 'debug';


const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[34m', // blue
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';


type SensitiveKey = 'password' | 'token' | 'accessToken' | 'refreshToken' | 'email' | 'userId';


function sanitizeSensitive(data: any): any {
  if (!isProd) return data;              
  if (data == null || typeof data !== 'object') return data;

  const clone = Array.isArray(data) ? [] : {};

  for (const key in data) {
    const val = (data as any)[key];
    if (['password', 'token', 'accessToken', 'refreshToken', 'email', 'userId'].includes(key)) {
      (clone as any)[key] = '***';
    } else if (typeof val === 'object' && val !== null) {
      (clone as any)[key] = sanitizeSensitive(val);
    } else {
      (clone as any)[key] = val;
    }
  }
  return clone;
}


interface LoggerFn {
  (msg: string, meta?: Record<string, unknown>): void;
}


function makeLogger(level: LogLevel): LoggerFn {
  const currentLevelValue = LEVEL_VALUE[DEFAULT_LEVEL];
  const thisLevelValue = LEVEL_VALUE[level];


  if (thisLevelValue < currentLevelValue) {
    return () => {}; 
  }

  return (msg: string, meta: Record<string, unknown> = {}) => {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = sanitizeSensitive(meta);

    if (isProd) {
      // ---- production : JSON line -------------------------------------------------
      const payload = {
        timestamp,
        level,
        message: msg,
        ...sanitizedMeta,
      };
      // console.log automatically adds newline
      console.log(JSON.stringify(payload));
    } else {
      // ---- development : colored, human readable ----------------------------------
      const color = COLORS[level];
      const metaString = Object.keys(sanitizedMeta).length
        ? ' ' + JSON.stringify(sanitizedMeta, null, 2)
        : '';
      const line = `${timestamp} ${color}${level.toUpperCase()}${RESET} ${msg}${metaString}`;
  
      if (level === 'error' || level === 'warn') {
        console.error(line);
      } else {
        console.log(line);
      }
    }
  };
}


export const log = {
  debug: makeLogger('debug'),
  info:  makeLogger('info'),
  warn:  makeLogger('warn'),
  error: makeLogger('error'),
};


export default {
  debug: log.debug,
  info:  log.info,
  warn:  log.warn,
  error: log.error,
};




// improvement version 
// src/core/utils/logger.ts

// import fs from 'fs';
// import path from 'path';

// const logDir = path.join(process.cwd(), 'logs');

// // Create logs directory if it doesn't exist
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir, { recursive: true });
// }

// export class Logger {
//   private getTimestamp(): string {
//     return new Date().toISOString();
//   }

//   private formatMessage(level: string, message: string, meta?: any): string {
//     const timestamp = this.getTimestamp();
//     const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
//     return `[${timestamp}] [${level}] ${message}${metaString}`;
//   }

//   private writeLog(level: string, message: string, meta?: any): void {
//     const formatted = this.formatMessage(level, message, meta);
//     const logFile = path.join(logDir, `${level.toLowerCase()}.log`);

//     fs.appendFileSync(logFile, formatted + '\n');
//   }

//   info(message: string, meta?: any): void {
//     console.log(`✓ ${message}`, meta || '');
//     this.writeLog('INFO', message, meta);
//   }

//   error(message: string, error?: any): void {
//     console.error(`✗ ${message}`, error || '');
//     this.writeLog('ERROR', message, error);
//   }

//   warn(message: string, meta?: any): void {
//     console.warn(`⚠ ${message}`, meta || '');
//     this.writeLog('WARN', message, meta);
//   }

//   debug(message: string, meta?: any): void {
//     if (process.env.DEBUG) {
//       console.log(`🐛 ${message}`, meta || '');
//       this.writeLog('DEBUG', message, meta);
//     }
//   }
// }

// export const logger = new Logger();