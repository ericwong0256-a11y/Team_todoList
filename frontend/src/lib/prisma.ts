import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** SQLite allows only one writer; multiple pooled connections often cause "database is locked" in dev. */
function sqliteUrlPreferSingleConnection(url: string | undefined): string | undefined {
  if (!url?.startsWith("file:")) return url;
  if (url.includes("connection_limit=")) return url;
  return url.includes("?") ? `${url}&connection_limit=1` : `${url}?connection_limit=1`;
}

const databaseUrl = sqliteUrlPreferSingleConnection(process.env.DATABASE_URL) ?? process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    ...(databaseUrl
      ? {
          datasources: {
            db: { url: databaseUrl }
          }
        }
      : {})
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
