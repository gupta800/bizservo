// @ts-nocheck
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Onboarding status enum
export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "not_started",
  "in_progress", 
  "completed",
  "abandoned"
]);

// Business type enum
export const businessTypeEnum = pgEnum("business_type", [
  "llc",
  "corporation",
  "partnership",
  "sole_proprietorship",
  "other"
]);

// Onboarding applications table
export const onboardingApplications = pgTable("onboarding_applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id"), // Optional - can be anonymous initially
  sessionId: text("session_id").notNull(), // For anonymous tracking
  status: onboardingStatusEnum("status").default("not_started").notNull(),
  currentStep: integer("current_step").default(1).notNull(),
  totalSteps: integer("total_steps").default(4).notNull(),
  
  // Step 1: Personal Information
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  
  // Step 2: Passport Information
  passportNumber: text("passport_number"),
  passportCountry: text("passport_country"),
  passportExpiryDate: date("passport_expiry_date"),
  passportImageUrl: text("passport_image_url"),
  
  // Step 3: Address Information
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  
  // Step 4: Business Information
  businessName: text("business_name"),
  businessType: businessTypeEnum("business_type"),
  businessDescription: text("business_description"),
  businessIndustry: text("business_industry"),
  estimatedRevenue: text("estimated_revenue"),
  
  // Metadata and tracking
  completedSteps: json("completed_steps").$type<number[]>().default([]),
  validationErrors: json("validation_errors").$type<Record<string, string[]>>(),
  autoSaveData: json("auto_save_data").$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  lastSavedAt: timestamp("last_saved_at").defaultNow().notNull(),
});

// Onboarding step validations
export const onboardingStepValidations = pgTable("onboarding_step_validations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  applicationId: integer("application_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  fieldName: text("field_name").notNull(),
  isValid: boolean("is_valid").default(false).notNull(),
  errorMessage: text("error_message"),
  validatedAt: timestamp("validated_at").defaultNow().notNull(),
});

// Auto-save history for recovery
export const onboardingAutoSaves = pgTable("onboarding_auto_saves", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  applicationId: integer("application_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  formData: json("form_data").$type<Record<string, any>>().notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertOnboardingApplicationSchema = createInsertSchema(onboardingApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSavedAt: true,
});

export const step1ValidationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name too long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone format"),
});

export const step2ValidationSchema = z.object({
  passportNumber: z.string().min(6, "Passport number must be at least 6 characters").max(20, "Passport number too long"),
  passportCountry: z.string().min(2, "Please select a country"),
  passportExpiryDate: z.string().refine((date) => {
    const expiry = new Date(date);
    const today = new Date();
    return expiry > today;
  }, "Passport must not be expired"),
});

export const step3ValidationSchema = z.object({
  streetAddress: z.string().min(5, "Please enter a complete street address"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().min(2, "Please enter state/province"),
  zipCode: z.string().min(3, "Please enter a valid postal code"),
  country: z.string().min(2, "Please select a country"),
});

export const step4ValidationSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name too long"),
  businessType: z.enum(["llc", "corporation", "partnership", "sole_proprietorship", "other"], {
    errorMap: () => ({ message: "Please select a business type" })
  }),
  businessDescription: z.string().min(10, "Please provide a detailed business description (at least 10 characters)").max(500, "Description too long"),
  businessIndustry: z.string().min(2, "Please select an industry"),
  estimatedRevenue: z.string().min(1, "Please select estimated revenue range"),
});

// TypeScript types
export type OnboardingApplication = typeof onboardingApplications.$inferSelect;
export type InsertOnboardingApplication = z.infer<typeof insertOnboardingApplicationSchema>;
export type OnboardingStepValidation = typeof onboardingStepValidations.$inferSelect;
export type OnboardingAutoSave = typeof onboardingAutoSaves.$inferSelect;

// Step validation types
export type Step1Data = z.infer<typeof step1ValidationSchema>;
export type Step2Data = z.infer<typeof step2ValidationSchema>;
export type Step3Data = z.infer<typeof step3ValidationSchema>;
export type Step4Data = z.infer<typeof step4ValidationSchema>;

// Extended types
export type OnboardingApplicationWithProgress = OnboardingApplication & {
  progressPercentage: number;
  nextStep: number;
  canProceed: boolean;
  missingFields: string[];
};

export type OnboardingFormData = {
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  step4: Partial<Step4Data>;
};
