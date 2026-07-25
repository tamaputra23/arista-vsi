import winston from "winston";

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "test" ? "error" : "info");

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.prettyPrint({ colorize: true })
  ),
  defaultMeta: {
    service: "vehicle-stock-platform",
    environment: process.env.NODE_ENV ?? "development",
  },
  transports: [new winston.transports.Console()],
});
