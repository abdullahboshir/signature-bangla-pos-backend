
import { Model, Types as _Types } from 'mongoose';

export type ISupportType = 'basic' | 'priority' | 'dedicated';
export type IBillingCycle = 'monthly' | 'yearly' | 'lifetime';
export type IAppliesTo = 'company' | 'business-unit';

export interface IPackageLimit {
    maxUsers?: number; // -1 for unlimited
    maxBusinessUnits?: number; // -1 for unlimited
    maxOutlets?: number; // -1 for unlimited (Total across all BUs)
    maxStorage?: number; // in MB, -1 for unlimited
    maxProducts?: number; // -1 for unlimited
    maxOrders?: number; // Per month, -1 for unlimited
}

export interface IModuleConfig {
    enabled: boolean;
    monthlyPrice?: number; // Optional price for this module if added individually
    limits?: Record<string, number | string | boolean>; // Per-module granular limits
}

export interface IPackage {
    name: string;
    slug: string;
    description?: string;
    appliesTo: IAppliesTo;

    trialPeriodDays?: number; // Duration of trial in days

    price: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly' | 'lifetime';
    sortOrder?: number;
    isPublic?: boolean; // Show on pricing page
    isRecommended?: boolean; // Highlight with ribbons
    highlightText?: string; // e.g., "Most Popular", "Best Value"
    shortDescription?: string; // One-liner for pricing cards
    recommendedFor?: string; // Target audience description
    icon?: string; // Lucide icon name or URL
    headerColor?: string; // Branding color for the package
    tags?: string[]; // e.g., ["New", "Limited"]
    supportType?: ISupportType;

    features: string[]; // List of feature descriptions
    limits: IPackageLimit;

    moduleAccess: {
        pos: IModuleConfig;
        erp: IModuleConfig;
        hrm: IModuleConfig;
        ecommerce: IModuleConfig;
        crm: IModuleConfig;
        logistics: IModuleConfig;
        accounting: IModuleConfig;
        reports: IModuleConfig;
        api_access: IModuleConfig;
    };

    isActive: boolean;
    isFeatured: boolean;
    isHidden?: boolean; // For legacy or internal-only plans
    status?: 'active' | 'inactive' | 'archived'; // For administrative control

    // --- Advanced Industrial Standard Fields ---
    setupFee?: number; // One-time setup fee
    supportTicketPriority?: 'low' | 'medium' | 'high' | 'urgent';
    isDefaultPlan?: boolean; // Default plan for new signups
    allowCustomOverride?: boolean; // Can this plan be customized per client?
    supportChannels?: string[]; // e.g., ["email", "chat", "phone", "dedicated_account_manager"]
    gracePeriodDays?: number; // Days allowed after expiration before suspension

    // --- Legal & Security ---
    tosUrl?: string;
    privacyPolicyUrl?: string;
    maxConcurrentLogins?: number; // Security limit
}

export type PackageModel = Model<IPackage>;
