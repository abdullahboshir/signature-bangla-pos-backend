import { z } from "zod";
import { Types } from "mongoose";

// Address Schema
const AddressSchema = z.object({
  country: z.string().default("Bangladesh"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  subDistrict: z.string().min(1, "Sub-district is required"),
  alliance: z.string().optional(),
  village: z.string().optional(),
  type: z.enum(["home", "work", "other"]),
  street: z.string().min(1, "Street is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  isDefault: z.boolean().default(false),
});

// Name Schema
const NameSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .trim(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .trim(),
  firstNameBangla: z.string()
    .max(50, "First name (Bangla) cannot exceed 50 characters")
    .trim()
    .optional(),
  lastNameBangla: z.string()
    .max(50, "Last name (Bangla) cannot exceed 50 characters")
    .trim()
    .optional(),
});

// Preferences Schema
const PreferencesSchema = z.object({
  language: z.enum(["en", "bn"]).default("en"),
  addresses: z.array(AddressSchema).default([]),
  currency: z.enum(["BDT", "USD"]).default("BDT"),
  newsletter: z.boolean().default(false),
  smsNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
});

// Main Customer Schema
export const createCustomerZodSchema = z.object({
  user: z.instanceof(Types.ObjectId),
  id: z.string().min(1, "ID is required").trim(),
  email: z.string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^01\d{9}$/, "Invalid phone number format. It must be 11 digits and start with 01.")
    .optional()
    .or(z.literal("")),
  name: NameSchema,
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
  dateOfBirth: z.date()
    .max(new Date(), "Date of birth must be in the past")
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  preferences: PreferencesSchema.default({
    language: "en",
    addresses: [],
    currency: "BDT",
    newsletter: false,
    smsNotifications: true,
    emailNotifications: true,
  }),
  loyaltyPoints: z.number()
    .int()
    .min(0, "Loyalty points cannot be negative")
    .default(0),
  membershipTier: z.enum(["regular", "silver", "gold", "platinum"])
    .default("regular"),
  wishlist: z.array(z.instanceof(Types.ObjectId)).default([]),
  recentlyViewed: z.array(z.instanceof(Types.ObjectId)).max(20, "Recently viewed cannot exceed 20 items").default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create Customer Schema (without auto-generated fields)
export const CreateCustomerSchema = createCustomerZodSchema.omit({
  id: true,
  loyaltyPoints: true,
  membershipTier: true,
  wishlist: true,
  recentlyViewed: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  user: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid user ID format",
  }),
});

// Update Customer Schema (all fields optional)
export const UpdateCustomerSchema = CreateCustomerSchema.partial();

// Response Schema (with virtuals)
export const CustomerResponseSchema = createCustomerZodSchema.extend({
  _id: z.instanceof(Types.ObjectId),
  fullName: z.string(),
  fullNameBangla: z.string(),
  age: z.number().nullable(),
}).omit({ user: true }); // Usually in response we might want to populate user

// Type exports
export type TCustomer = z.infer<typeof createCustomerZodSchema>;
export type TCreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type TUpdateCustomer = z.infer<typeof UpdateCustomerSchema>;
export type TCustomerResponse = z.infer<typeof CustomerResponseSchema>;

// Validation functions
export const validateCustomer = (data: unknown) => createCustomerZodSchema.safeParse(data);
export const validateCreateCustomer = (data: unknown) => CreateCustomerSchema.safeParse(data);
export const validateUpdateCustomer = (data: unknown) => UpdateCustomerSchema.safeParse(data);

// Utility schemas for specific operations
export const CustomerWishlistSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid product ID format",
  }),
});

export const CustomerRecentlyViewedSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid product ID format",
  }),
});

export const CustomerPreferencesUpdateSchema = PreferencesSchema.partial();