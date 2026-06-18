const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true })),
  transports: [
    new transports.Console({ format: combine(colorize(), timestamp(), logFormat) }),
    new transports.File({ filename: 'logs/error.log', level: 'error', format: combine(timestamp(), logFormat) }),
    new transports.File({ filename: 'logs/combined.log', format: combine(timestamp(), logFormat) })
  ],
  exitOnError: false,
});

module.exports = logger;
