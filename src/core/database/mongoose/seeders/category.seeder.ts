
import { Category } from "../../../../app/modules/commerce/catalog/category/category.model.js";
import { BUSINESS_INDUSTRY_ARRAY } from "../../../../app/modules/platform/organization/business-unit/core/business-unit.constant.js";
import "colors";

export const seedCategories = async () => {
    try {
        console.log("🌱 Seeding Global Categories...".blue);

        for (const industry of BUSINESS_INDUSTRY_ARRAY) {
            const name = industry.charAt(0).toUpperCase() + industry.slice(1).replace(/_/g, " ");

            const existing = await Category.findOne({
                slug: industry,
                businessUnit: null
            });

            if (!existing) {
                await Category.create({
                    name: name,
                    slug: industry, // Use the industry key as slug for 1:1 mapping
                    businessUnit: null, // Global Category
                    level: 0,
                    isActive: true
                });
                console.log(`   ✅ Created Category: ${name}`.green);
            }
        }

        console.log("✨ Global Categories Seeding Completed".cyan);
    } catch (error: any) {
        console.error("❌ Category Seeding Failed:".red, error?.message);
    }
};
