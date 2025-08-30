CREATE TYPE "public"."business_type" AS ENUM('llc', 'corporation', 'partnership', 'sole_proprietorship', 'other');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status" AS ENUM('not_started', 'in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "onboarding_applications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "onboarding_applications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"session_id" text NOT NULL,
	"status" "onboarding_status" DEFAULT 'not_started' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"total_steps" integer DEFAULT 4 NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"passport_number" text,
	"passport_country" text,
	"passport_expiry_date" date,
	"passport_image_url" text,
	"street_address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"business_name" text,
	"business_type" "business_type",
	"business_description" text,
	"business_industry" text,
	"estimated_revenue" text,
	"completed_steps" json DEFAULT '[]'::json,
	"validation_errors" json,
	"auto_save_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"last_saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_auto_saves" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "onboarding_auto_saves_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"application_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"form_data" json NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_step_validations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "onboarding_step_validations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"application_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"field_name" text NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"validated_at" timestamp DEFAULT now() NOT NULL
);
