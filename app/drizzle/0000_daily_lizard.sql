CREATE TYPE "public"."client_status" AS ENUM('active', 'inactive', 'pending', 'completed', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'uploaded', 'reviewed', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('not_started', 'in_progress', 'review', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "client_communications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "client_communications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" integer NOT NULL,
	"project_id" integer,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"direction" text NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_for" timestamp,
	"completed_at" timestamp,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "client_documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "client_documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" integer NOT NULL,
	"project_id" integer,
	"title" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"uploaded_by" integer,
	"reviewed_by" integer,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "client_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'not_started' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"estimated_hours" integer,
	"actual_hours" integer DEFAULT 0,
	"budget" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"status" "client_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"assigned_to" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" json,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "progress_updates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "progress_updates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" integer NOT NULL,
	"project_id" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"update_type" text NOT NULL,
	"previous_status" text,
	"new_status" text,
	"hours_worked" integer DEFAULT 0,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "stripe_customers" (
	"userId" integer PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
