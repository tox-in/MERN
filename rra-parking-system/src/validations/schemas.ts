import { z } from "zod";
import { Role, CarCategory } from "@prisma/client";

export const registerUserSchema = z.object({
  owner_name: z.string().min(3).max(100),
  national_id: z.string().min(16).max(16),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role).optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateUserSchema = z.object({
  owner_name: z.string().min(3).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(8).max(100).optional(),
});

// Car validation schemas
export const createCarSchema = z.object({
  isPublic: z.boolean().optional(),
  company: z.string().optional(),
  owner_name: z.string().min(3).max(100),
  category: z.nativeEnum(CarCategory),
  plate_number: z.string().min(7).max(8),
});

export const updateCarSchema = z.object({
  isPublic: z.boolean().optional(),
  company: z.string().optional(),
  owner_name: z.string().min(3).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const updateCarStatusSchema = z.object({
  isActive: z.boolean(),
});

// Parking session validation schemas
export const createSessionSchema = z.object({
  carId: z.string().uuid(),
  entry_time: z.string().or(z.date()).optional(), // Optional because we might use current time by default
});

export const updateSessionSchema = z.object({
  exit_time: z.string().or(z.date()).optional(), // Optional because we might use current time by default
  hasLeft: z.boolean().optional(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().transform(Number).optional().default("1"),
  limit: z.string().transform(Number).optional().default("10"),
});

export const carFilterSchema = z
  .object({
    search: z.string().optional(),
    category: z.nativeEnum(CarCategory).optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    ownerId: z.string().uuid().optional(),
  })
  .merge(paginationSchema);

export const sessionFilterSchema = z
  .object({
    carId: z.string().uuid().optional(),
    hasLeft: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .merge(paginationSchema);

export const reportFilterSchema = z
  .object({
    carId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .merge(paginationSchema);
