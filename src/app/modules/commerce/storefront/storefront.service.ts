import { Types } from "mongoose";
import { StorefrontConfig, StorePage } from "./storefront.model.ts";
import type { IStorefrontConfig, IStorePage } from "./storefront.model.ts";
import AppError from "@shared/errors/app-error.ts";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";
import { CatalogProductAdapter } from "@app/modules/catalog/index.ts";

export class StorefrontService {

    /**
     * Get Products for Storefront (Public)
     */
    static async getStoreProducts(businessUnitIdentifier: string, query: any) {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);

        const filter: any = {
            businessUnit: businessUnitId,
            status: 'active'
        };

        if (query.categoryId) {
            filter.primaryCategory = new Types.ObjectId(query.categoryId as string);
        }

        const limit = query.limit ? parseInt(query.limit as string) : 10;

        return await CatalogProductAdapter.searchProducts(filter, limit);
    }

    /**
     * Helper to resolve Business Unit ID (handles Slug or ID)
     */
    private static async resolveBusinessUnitId(identifier: string): Promise<Types.ObjectId> {
        let businessUnit;

        if (Types.ObjectId.isValid(identifier)) {
            businessUnit = await BusinessUnit.findById(identifier);
        }

        // If not found by ID or invalid ID, try finding by slug
        if (!businessUnit) {
            businessUnit = await BusinessUnit.findOne({ slug: identifier });
        }

        if (!businessUnit) {
            throw new AppError(404, "Business Unit not found", "BUSINESS_UNIT_NOT_FOUND");
        }

        return businessUnit._id as Types.ObjectId;
    }

    /**
     * Get Config for a Store
     */
    static async getStoreConfig(businessUnitIdentifier: string): Promise<IStorefrontConfig | null> {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);
        return await StorefrontConfig.findOne({ businessUnit: businessUnitId });
    }

    /**
     * Create or Update Store Config
     */
    static async updateStoreConfig(
        businessUnitIdentifier: string,
        payload: Partial<IStorefrontConfig>
    ): Promise<IStorefrontConfig> {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);

        const config = await StorefrontConfig.findOneAndUpdate(
            { businessUnit: businessUnitId },
            {
                $set: { ...payload, businessUnit: businessUnitId }
            },
            { new: true, upsert: true, runValidators: true }
        );
        return config;
    }

    /**
     * Get a specific page by slug
     */
    static async getPage(businessUnitIdentifier: string, slug: string): Promise<IStorePage | null> {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);
        return await StorePage.findOne({ businessUnit: businessUnitId, slug });
    }

    /**
     * Create or Update a Page Layout
     */
    static async savePageLayout(
        businessUnitIdentifier: string,
        slug: string,
        data: Partial<IStorePage>
    ): Promise<IStorePage> {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);

        // Prepare block data
        // TODO: Sanitize block data here if necessary

        const page = await StorePage.findOneAndUpdate(
            { businessUnit: businessUnitId, slug },
            {
                $set: {
                    ...data,
                    businessUnit: businessUnitId, // Valid ObjectId
                    slug: slug // Ensure slug matches
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return page;
    }

    /**
     * Get All Pages for a Store (For Admin List)
     */
    static async getAllPages(businessUnitIdentifier: string) {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);
        return await StorePage.find({ businessUnit: businessUnitId })
            .select('title slug isPublished updatedAt')
            .sort({ updatedAt: -1 });
    }

    /**
     * Delete a Page
     */
    static async deletePage(businessUnitIdentifier: string, pageId: string) {
        const businessUnitId = await this.resolveBusinessUnitId(businessUnitIdentifier);
        const page = await StorePage.findOneAndDelete({ _id: pageId, businessUnit: businessUnitId });
        if (!page) throw new AppError(404, "Page not found", "PAGE_NOT_FOUND");
        return page;
    }
}
