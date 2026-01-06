
import { Category } from "../../../../app/modules/commerce/catalog/category/category.model.js";
import { BUSINESS_INDUSTRY_ARRAY } from "../../../../app/modules/platform/organization/business-unit/core/business-unit.constant.js";
import "colors";

import mongoose from "mongoose";

export const seedCategories = async ({ session }: { session?: mongoose.ClientSession } = {}) => {
    try {
        console.log("🌱 Seeding Global Categories...".blue);

        for (const industry of BUSINESS_INDUSTRY_ARRAY) {
            const name = industry.charAt(0).toUpperCase() + industry.slice(1).replace(/_/g, " ");

            // Check for EXISTING category by EITHER:
            // 1. Slug (Logical ID)
            // 2. Name + BusinessUnit: null (Duplicate Key protection)
            const existing = await Category.findOne({
                $or: [
                    { slug: industry, businessUnit: null },
                    { name: name, businessUnit: null }
                ]
            }).session(session || null);

            if (!existing) {
                await Category.create([{
                    name: name,
                    slug: industry, // Use the industry key as slug for 1:1 mapping
                    businessUnit: null, // Global Category
                    level: 0,
                    isActive: true
                }], { session });
                console.log(`   ✅ Created Category: ${name}`.green);
            }
        }

        console.log("✨ Global Categories Seeding Completed".cyan);
    } catch (error: any) {
        // Log but don't crash main process unless vital
        console.error("❌ Category Seeding Failed:".red, error?.message);
        throw error; // Throw so transaction aborts
    }
};
