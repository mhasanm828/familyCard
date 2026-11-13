import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * PrismaClient for MongoDB (Atlas or a local mongod).
 * MongoDB needs no driver adapter in Prisma 7 — the client talks to
 * MongoDB through Prisma's own query engine. DATABASE_URL must be a
 * mongodb:// or mongodb+srv:// connection string (see .env.example).
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
