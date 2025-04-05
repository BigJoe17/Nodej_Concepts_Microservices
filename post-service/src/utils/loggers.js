const pino = require("pino");
const winston = require("winston");

// Read from environment variable or default to 'pino'
const LOGGING_LIB = process.env.LOGGING_LIB || "winston";

let logger;

if (LOGGING_LIB === "pino") {
  logger = pino({
    transport: {
      target: "pino-pretty", // Makes it readable
      options: { colorize: true },
    },
  });
} else {
  logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
     winston.format.errors({ stack: true }),
    ),
    transports: [new winston.transports.Console()],
  });
}

// Wrapper function to keep logging calls consistent
const log = {
  info: (msg, meta) => logger.info(msg, meta || {}),
  error: (msg, meta) => logger.error(msg, meta || {}),
  warn: (msg, meta) => logger.warn(msg, meta || {}),
  debug: (msg, meta) => logger.debug?.(msg, meta || {}),
};



module.exports = logger;