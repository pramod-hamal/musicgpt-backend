import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

/**
 * Pretty format for console (humans)
 */
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, context, stack }) => {
    return (
      `${timestamp} ${level}` +
      `${context ? ' [' + context + ']' : ''} ` +
      `${stack ?? message}`
    );
  }),
);

/**
 * Structured format for files (machines)
 */
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    new (winston.transports as any).DailyRotateFile({
      dirname: 'logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '3d',
      format: fileFormat,
    }),

    new (winston.transports as any).DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '3d',
      format: fileFormat,
    }),
  ],
});
