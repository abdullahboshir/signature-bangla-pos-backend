// Operational Model (How the business operates)
export const BUSINESS_MODEL = {
    RETAIL: 'retail',             // B2C, Physical/Online Store
    WHOLESALE: 'wholesale',       // B2B, Bulk Selling
    DISTRIBUTOR: 'distributor',   // Logistics & Supply Chain
    MANUFACTURING: 'manufacturing', // Production
    SERVICE: 'service',           // Service-based (Salon, Repair)
    ONLINE_ONLY: 'online_only',   // E-commerce/Dark Store
    HYBRID: 'hybrid',             // Retail + Wholesale
    MARKETPLACE: 'marketplace',   // Multi-vendor Platform
} as const;

// Industry / Market Segment (What the business sells)
export const BUSINESS_INDUSTRY = {
    FASHION: 'fashion',             // Apparel, Accessories
    ELECTRONICS: 'electronics',     // Gadgets, Appliances
    GROCERY: 'grocery',             // Supermarket, FMCG
    PHARMACY: 'pharmacy',           // Medicine, Healthcare
    RESTAURANT: 'restaurant',       // F&B, Cafe
    BEAUTY: 'beauty',               // Cosmetics, Salon
    FURNITURE: 'furniture',         // Home Decor
    AUTOMOTIVE: 'automotive',       // Parts, Vehicles
    BOOKS_STATIONERY: 'books_stationery',
    GENERAL: 'general',             // Departmental Store
    OTHER: 'other'
} as const;

export const BUSINESS_INDUSTRY_ARRAY = Object.values(BUSINESS_INDUSTRY);

export const BUSINESS_MODEL_ARRAY = Object.values(BUSINESS_MODEL);

export const BUSINESS_UNIT_STATUS = {
    DRAFT: 'draft',
    UNDER_REVIEW: 'under_review',
    PUBLISHED: 'published',
    SUSPENDED: 'suspended',
    ARCHIVED: 'archived',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const;

export const BUSINESS_UNIT_STATUS_ARRAY = Object.values(BUSINESS_UNIT_STATUS);

// System Modules (Access Control Checks)
export const SYSTEM_MODULES = {
    POS: 'pos',             // Point of Sale
    ERP: 'erp',             // Inventory, Purchasing, Accounts
    HRM: 'hrm',             // Staff, Attendance, Payroll
    ECOMMERCE: 'ecommerce', // Online Storefront
    CRM: 'crm',             // Customers, Marketing, Tickets
    LOGISTICS: 'logistics', // Couriers, Shipments
} as const;

export const SYSTEM_MODULES_ARRAY = Object.values(SYSTEM_MODULES);
