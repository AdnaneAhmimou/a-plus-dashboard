function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get JWT_ACCESS_SECRET() {
    return requireEnv("JWT_ACCESS_SECRET");
  },
  get JWT_REFRESH_SECRET() {
    return requireEnv("JWT_REFRESH_SECRET");
  },
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || "15m",
  JWT_REFRESH_TTL_DAYS: Number(process.env.JWT_REFRESH_TTL_DAYS || "30"),
  isProduction: process.env.NODE_ENV === "production",
};
