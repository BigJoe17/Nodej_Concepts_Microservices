//const winston = require('winston');

// const logger = winston.createLogger({
//     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json(),
//         winston.format.errors({ stack: true }),
//         winston.format.splat(),

//     ),
//     defaultMeta: { service: 'identity-service' },
//     transports: [
//         new winston.transports.Console({
//             format: winston.format.combine(
//                 winston.format.colorize(),
//                 winston.format.simple()
//             )
//         }),
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' }),

//     ]
// });


// const pino = require('pino');

// const logger = pino({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

//     defaultMeta: { service: 'identity-service' },
//     transport: {
//         target: "pino-pretty", // Formats the logs nicely
//         options: { colorize: true },
//       },
// })


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