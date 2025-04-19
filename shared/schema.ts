import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Symptoms table
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Medications table
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  dosage: text("dosage").notNull(),
  price: integer("price").notNull(), // Price in cents
  stock: integer("stock").default(100).notNull(),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  diagnosis: text("diagnosis").notNull(),
  additionalRecommendations: text("additional_recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAiGenerated: boolean("is_ai_generated").default(true).notNull(),
  status: text("status").default("active").notNull(), // active, completed, cancelled
});

// Prescription medications junction table
export const prescriptionMedications = pgTable("prescription_medications", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").notNull(),
  medicationId: integer("medication_id").notNull(),
  instructions: text("instructions").notNull(),
  quantity: integer("quantity").notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  prescriptionId: integer("prescription_id"),
  total: integer("total").notNull(), // Total in cents
  status: text("status").default("pending").notNull(), // pending, processing, shipped, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  medicationId: integer("medication_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Price at time of order in cents
});

// Schema for inserting a user
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

// Schema for inserting a symptom
export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
});

// Schema for inserting a medication
export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

// Schema for inserting a prescription
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting a prescription medication
export const insertPrescriptionMedicationSchema = createInsertSchema(prescriptionMedications).omit({
  id: true,
});

// Schema for inserting an order
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting an order item
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Symptom = typeof symptoms.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type PrescriptionMedication = typeof prescriptionMedications.$inferSelect;
export type InsertPrescriptionMedication = z.infer<typeof insertPrescriptionMedicationSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Additional validation schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const symptomCheckerSchema = z.object({
  mainSymptom: z.string().min(1, "Please select a primary symptom"),
  additionalSymptoms: z.array(z.string()).optional(),
  duration: z.string().min(1, "Please select a duration"),
  severity: z.number().min(1).max(10),
  details: z.string().optional(),
});

export type SymptomCheckerData = z.infer<typeof symptomCheckerSchema>;

// Types for full prescription with medications
export type PrescriptionWithMedications = Prescription & {
  medications: (PrescriptionMedication & { medication: Medication })[];
};
