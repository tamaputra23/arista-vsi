import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_KEYS: z.string().min(1, "At least one API key is required"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  CACHE_TTL: z.coerce.number().int().positive().default(300),
  APP_VERSION: z.string().default("1.0.0"),

  // Phase 4: JWT Auth — JWT_SECRET is required for JWT verification
  // Both JWT (Authorization: Bearer) + API-key (X-API-Key) are mandatory per request
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();

/** Parse comma-separated API_KEYS into a Map<key, role> for quick lookup */
export const validApiKeys = new Map<string, string>();
for (const entry of env.API_KEYS.split(",").map((k) => k.trim()).filter(Boolean)) {
  if (entry.includes(":")) {
    const [role, key] = entry.split(":", 2);
    validApiKeys.set(key, role);
  } else {
    // No role prefix — default to "branch"
    validApiKeys.set(entry, "branch");
  }
}
