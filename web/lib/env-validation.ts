/**
 * Environment validation using Zod
 */

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default("AI Growth Planner"),
  NEXT_PUBLIC_ENABLE_DEBUG: z.string().optional().default("false"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
});

type Env = z.infer<typeof envSchema>;

const processEnv: Record<string, string | undefined> = {
  NEXT_PUBLIC_API_URL: process.env["NEXT_PUBLIC_API_URL"],
  NEXT_PUBLIC_APP_NAME: process.env["NEXT_PUBLIC_APP_NAME"],
  NEXT_PUBLIC_ENABLE_DEBUG: process.env["NEXT_PUBLIC_ENABLE_DEBUG"],
  NODE_ENV: process.env["NODE_ENV"],
};

export const env = envSchema.parse(processEnv);
