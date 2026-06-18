
// Winston logger setup
// - Console transport for development-friendly colored output
// - File transports for persisted logs (`logs/error.log` for errors, `logs/combined.log` for all)
// - Includes timestamps and error stacks for better observability
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, colorize } = format;

// Custom log format: timestamp + level + message/stack
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  // Allow overriding the level via `LOG_LEVEL` env var
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true })),
  transports: [
    // Console with colorized output (useful during development)
    new transports.Console({ format: combine(colorize(), timestamp(), logFormat) }),
    // Persistent files for production log analysis
    new transports.File({ filename: 'logs/error.log', level: 'error', format: combine(timestamp(), logFormat) }),
    new transports.File({ filename: 'logs/combined.log', format: combine(timestamp(), logFormat) })
  ],
  exitOnError: false,
});

// Export the configured logger for use across the app
module.exports = logger;
