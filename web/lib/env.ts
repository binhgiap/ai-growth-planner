/**
 * Environment variable configuration
 * Type-safe environment variables with defaults
 */

export const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000";

export const APP_NAME = process.env["NEXT_PUBLIC_APP_NAME"] || "AI Growth Planner";
export const APP_DESCRIPTION =
  process.env["NEXT_PUBLIC_APP_DESCRIPTION"] || "Personalized 6-month development roadmap powered by AI";

export const FEATURES = {
  ANALYTICS: process.env["NEXT_PUBLIC_ENABLE_ANALYTICS"] === "true",
  REPORTING: process.env["NEXT_PUBLIC_ENABLE_REPORTING"] !== "false",
  DEBUG: process.env["NEXT_PUBLIC_ENABLE_DEBUG"] === "true",
};

export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";

// Validation
if (typeof window === "undefined" && !API_BASE_URL && IS_PRODUCTION) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}
