// @ts-nocheck

// MANDATORY CORE TABLES - Always include these
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text().notNull().unique(),
  password: text().notNull(),
});

export const stripeCustomersTable = pgTable("stripe_customers", {
  userId: integer().primaryKey(),
  customerId: text().notNull(),
});

// Export all schema modules
export * from "./clients.schema.server";
export * from "./onboarding.schema.server";
