// Prisma config — the connection URL lives in prisma/schema.prisma.
// MongoDB has no migrations — the schema is applied with
// `prisma db push` (see README.md).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
});
