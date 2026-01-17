import { Schema, model, Types } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

// ============================================================================
// Interfaces
// ============================================================================

export interface IStorefrontConfig {
    company: Types.ObjectId;
    businessUnit: Types.ObjectId;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        backgroundColor: string;
        fontFamily: string;
    };
    navbar: {
        logo?: string;
        links: Array<{ label: string; url: string; type: 'link' | 'category' | 'page' }>;
        showSearch: boolean;
        showCart: boolean;
    };
    footer: {
        description?: string;
        links: Array<{ label: string; url: string }>;
        copyrightText?: string;
        socialLinks: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            youtube?: string;
        };
    };
}

export interface IPageBlock {
    id: string;
    type: string; // 'HERO_SLIDER', 'PRODUCT_GRID', 'BANNER', 'TEXT_BLOCK', etc.
    data: Record<string, any>; // Flexible data storage for any block type
    styles?: Record<string, any>; // Custom CSS-in-JS styles
    isVisible: boolean;
    order: number;
}

export interface IStorePage {
    company: Types.ObjectId;
    businessUnit: Types.ObjectId;
    slug: string; // 'home', 'about-us', 'contact'
    title: string;
    blocks: IPageBlock[];
    isPublished: boolean;
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
}

// ============================================================================
// Schemas
// ============================================================================

const StorefrontConfigSchema = new Schema<IStorefrontConfig>(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: "BusinessUnit",
            required: true,
            unique: true,
            index: true
        },
        theme: {
            primaryColor: { type: String, default: "#f85606" }, // Daraz orange default
            secondaryColor: { type: String, default: "#1a1a1a" },
            backgroundColor: { type: String, default: "#f5f5f5" },
            fontFamily: { type: String, default: "Inter" }
        },
        navbar: {
            logo: String,
            links: [{
                label: String,
                url: String,
                type: { type: String, enum: ['link', 'category', 'page'], default: 'link' }
            }],
            showSearch: { type: Boolean, default: true },
            showCart: { type: Boolean, default: true }
        },
        footer: {
            description: String,
            links: [{ label: String, url: String }],
            copyrightText: String,
            socialLinks: {
                facebook: String,
                twitter: String,
                instagram: String,
                youtube: String
            }
        }
    },
    { timestamps: true }
);

const StorePageSchema = new Schema<IStorePage>(
    {
        company: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: "BusinessUnit",
            required: true,
            index: true
        },
        slug: {
            type: String,
            required: true,
            trim: true
        },
        title: {
            type: String,
            required: true
        },
        blocks: [
            {
                id: { type: String, required: true },
                type: { type: String, required: true },
                data: { type: Schema.Types.Mixed, default: {} },
                styles: { type: Schema.Types.Mixed, default: {} },
                isVisible: { type: Boolean, default: true },
                order: { type: Number, default: 0 }
            }
        ],
        isPublished: { type: Boolean, default: true },
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [String]
        }
    },
    { timestamps: true }
);

// Ensure unique slug per business unit
StorePageSchema.index({ businessUnit: 1, slug: 1 }, { unique: true });
StorePageSchema.index({ businessUnit: 1 });
StorePageSchema.index({ isPublished: 1 });

export const StorefrontConfig = model<IStorefrontConfig>("StorefrontConfig", StorefrontConfigSchema);
export const StorePage = model<IStorePage>("StorePage", StorePageSchema);

// Apply Context-Aware Data Isolation
StorefrontConfigSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});

StorePageSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
