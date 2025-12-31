export const BUSINESS_UNIT_STATUS = {
  DRAFT: "draft",
  UNDER_REVIEW: "under_review",
  PUBLISHED: "published",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
} as const;

export const BUSINESS_UNIT_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  UNLISTED: "unlisted",
} as const;

export const BUSINESS_UNIT_TYPE = {
  GENERAL: "general",
  BOUTIQUE: "boutique",
  BRAND: "brand",
  MARKETPLACE: "marketplace",
  SPECIALTY: "specialty",
} as const;

export const BUSINESS_UNIT_CURRENCY = {
  BDT: "BDT",
  USD: "USD",
} as const;

export const BUSINESS_UNIT_LANGUAGE = {
  ENGLISH: "en",
  BANGLA: "bn",
} as const;

export const PAYOUT_METHODS = {
  BANK_TRANSFER: "bank_transfer",
  MOBILE_BANKING: "mobile_banking",
  DIGITAL_WALLET: "digital_wallet",
} as const;

export const PAYOUT_SCHEDULES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  BI_WEEKLY: "bi-weekly",
  MONTHLY: "monthly",
} as const;

export const TRANSACTION_TYPES = {
  SALE: "sale",
  REFUND: "refund",
  PAYOUT: "payout",
  FEE: "fee",
  ADJUSTMENT: "adjustment",
  COMMISSION: "commission",
} as const;

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export const SHIPPING_CALCULATION = {
  FLAT: "flat",
  WEIGHT: "weight",
  PRICE: "price",
  FREE: "free",
} as const;

export const TAX_BASED_ON = {
  SHIPPING: "shipping",
  BILLING: "billing",
  BUSINESS_UNIT: "BUSINESS_UNIT",
} as const;

export const SORT_OPTIONS = {
  NEWEST: "newest",
  POPULAR: "popular",
  PRICE_LOW: "price_low",
  PRICE_HIGH: "price_high",
  RATING: "rating",
} as const;

export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  AVERAGE: 60,
  POOR: 40,
} as const;