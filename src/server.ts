import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

async function main() {
  // Verify database connection on startup
  try {
    await prisma.$connect();
    logger.info("Database connected", { databaseUrl: env.DATABASE_URL.split("@")[1] });
  } catch (err) {
    logger.error("Failed to connect to database", { error: (err as Error).message });
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Server started`, {
      port: env.PORT,
      environment: env.NODE_ENV,
      version: env.APP_VERSION,
    });
  });

  // ---- Graceful shutdown ----

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Server shut down complete");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
