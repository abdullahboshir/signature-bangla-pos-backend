import mongoose from "mongoose";

/**
 * Augments the query object with standard Business Unit scoping logic.
 * Supports: ID or Slug.
 * Logic: Match specific BU ID OR Global (null) OR Missing field.
 */
export const resolveBusinessUnitQuery = async (query: any) => {
    if (query.businessUnit) {
        let businessUnit = query.businessUnit;
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();

        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        let buId: string | null = null;

        if (!isBuObjectId) {
            // Dynamic import to avoid circular dependency if models import utils
            const BusinessUnit = mongoose.model("BusinessUnit");
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: businessUnit }, { slug: businessUnit }]
            });

            if (buDoc) {
                buId = buDoc._id;
            }
            // If not found, we could throw or return empty. Standard logic seemed to be "if valid slug but not found, return empty results"?
            // But here we set buId to null if not found? 
            // Actually, if a user filters by "invalid-bu", they should get 0 results, not global results.
            if (!buDoc) {
                // Force a mismatch
                query['_id'] = new mongoose.Types.ObjectId(); // Random ID
                delete query.businessUnit;
                return query;
            }
        } else {
            buId = businessUnit;
        }

        if (buId) {
            query['$or'] = [
                { businessUnit: buId },
                { businessUnit: null },
                { businessUnit: { $exists: false } }
            ];
        }

        delete query.businessUnit;
    }
    return query;
};
