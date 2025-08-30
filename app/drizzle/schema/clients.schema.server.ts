// @ts-nocheck
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Client status enum
export const clientStatusEnum = pgEnum("client_status", [
  "active",
  "inactive", 
  "pending",
  "completed",
  "on_hold"
]);

// Project status enum
export const projectStatusEnum = pgEnum("project_status", [
  "not_started",
  "in_progress",
  "review",
  "completed",
  "cancelled"
]);

// Document status enum
export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "uploaded",
  "reviewed",
  "approved",
  "rejected"
]);

// Clients table
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  company: text("company"),
  status: clientStatusEnum("status").default("active").notNull(),
  notes: text("notes"),
  assignedTo: integer("assigned_to"), // User ID of assigned team member
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: json("metadata").$type<{
    industry?: string;
    source?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  }>(),
});

// Client projects table
export const clientProjects = pgTable("client_projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("not_started").notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours").default(0),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client documents table
export const clientDocuments = pgTable("client_documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"), // Optional - can be project-specific
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: documentStatusEnum("status").default("pending").notNull(),
  uploadedBy: integer("uploaded_by"), // User ID who uploaded
  reviewedBy: integer("reviewed_by"), // User ID who reviewed
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Progress updates table
export const progressUpdates = pgTable("progress_updates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"), // Optional
  title: text("title").notNull(),
  description: text("description").notNull(),
  updateType: text("update_type").notNull(), // milestone, status_change, general
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  hoursWorked: integer("hours_worked").default(0),
  createdBy: integer("created_by").notNull(), // User ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: json("metadata").$type<{
    attachments?: string[];
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }>(),
});

// Client communications table
export const clientCommunications = pgTable("client_communications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"), // Optional
  type: text("type").notNull(), // email, call, meeting, note
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  scheduledFor: timestamp("scheduled_for"), // For meetings/calls
  completedAt: timestamp("completed_at"),
  metadata: json("metadata").$type<{
    attendees?: string[];
    duration?: number;
    outcome?: string;
  }>(),
});

// Zod schemas for validation
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(clientProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(clientDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressUpdateSchema = createInsertSchema(progressUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationSchema = createInsertSchema(clientCommunications).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = z.infer<typeof insertProjectSchema>;
export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = z.infer<typeof insertDocumentSchema>;
export type ProgressUpdate = typeof progressUpdates.$inferSelect;
export type InsertProgressUpdate = z.infer<typeof insertProgressUpdateSchema>;
export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type InsertClientCommunication = z.infer<typeof insertCommunicationSchema>;

// Extended types for joined data
export type ClientWithProjects = Client & {
  projects: ClientProject[];
  projectCount: number;
  activeProjects: number;
};

export type ClientWithDetails = Client & {
  projects: ClientProject[];
  documents: ClientDocument[];
  recentUpdates: ProgressUpdate[];
  communications: ClientCommunication[];
};

export type ProjectWithClient = ClientProject & {
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
  };
};
