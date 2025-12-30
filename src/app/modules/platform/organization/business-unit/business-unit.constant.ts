export const BUSINESS_UNIT_STATUS = {
    DRAFT: 'draft',
    UNDER_REVIEW: 'under_review',
    PUBLISHED: 'published',
    SUSPENDED: 'suspended',
    ARCHIVED: 'archived',
    // Legacy
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const;

export const BUSINESS_UNIT_TYPE = {
    GENERAL: 'general',
    BOUTIQUE: 'boutique',
    BRAND: 'brand',
    MARKETPLACE: 'marketplace',
    SPECIALTY: 'specialty',
    // Legacy
    RETAIL: 'retail',
    WHOLESALE: 'wholesale',
    SERVICE: 'service',
} as const;

export const BUSINESS_UNIT_STATUS_ARRAY = Object.values(BUSINESS_UNIT_STATUS);
export const BUSINESS_UNIT_TYPE_ARRAY = Object.values(BUSINESS_UNIT_TYPE);
