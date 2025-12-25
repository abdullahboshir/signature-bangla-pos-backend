import mongoose from "mongoose";
import AppError from "@shared/errors/app-error.ts";

/**
 * Resolves a Business Unit Identifier (ID or Slug) to a MongoDB ObjectId.
 * Useful for create/update operations where the UI might send a Slug or String ID.
 * 
 * @param identifier - The Business Unit ID or Slug (string or ObjectId)
 * @returns Promise<mongoose.Types.ObjectId>
 * @throws AppError if not found
 */
export const resolveBusinessUnitId = async (identifier: string | mongoose.Types.ObjectId | undefined | null): Promise<mongoose.Types.ObjectId | undefined> => {
    if (!identifier) return undefined;

    // If it's already a valid ObjectId instance, return it (cast to be sure)
    if (identifier instanceof mongoose.Types.ObjectId) {
        return identifier;
    }

    const idStr = identifier.toString().trim();

    // Check if it's a valid ObjectId string
    const isObjectId = mongoose.Types.ObjectId.isValid(idStr) && /^[0-9a-fA-F]{24}$/.test(idStr);

    if (isObjectId) {
        // Optimistically return as ObjectId. 
        // Note: We don't verify existence here to save a DB call if the caller trusts the ID.
        // But if the user wants verification, they can use resolveBusinessUnitIdWithVerification (below)
        // For backwards compatibility with current logic (which often falls back to find), let's just return it.
        // However, current logic often checks if valid, if NOT valid then searches.
        return new mongoose.Types.ObjectId(idStr);
    }

    // It's a slug or custom ID, search for it
    const BusinessUnit = mongoose.models['BusinessUnit'] || mongoose.model("BusinessUnit"); // Dynamic import/access

    const buDoc = await BusinessUnit.findOne({
        $or: [{ id: idStr }, { slug: idStr }]
    });

    if (!buDoc) {
        throw new AppError(404, `Business Unit Not Found: '${idStr}'`);
    }

    return buDoc._id;
};

/**
 * Sanitizes a payload by removing fields with empty string values.
 * Useful for cleaning up form data where optional fields are sent as "".
 * 
 * @param payload - The object to clean
 * @param fieldsToClean - Optional array of specific keys to check. If omitted, checks all.
 * @returns Cleaned object (shallow copy)
 */
export const sanitizePayload = (payload: any, fieldsToClean?: string[]) => {
    if (!payload || typeof payload !== 'object') return payload;

    const cleaned = { ...payload };

    if (fieldsToClean) {
        fieldsToClean.forEach(field => {
            if (cleaned[field] === "") {
                cleaned[field] = undefined;
                // delete cleaned[field]; // or undefined, mongoose ignores undefined usually
            }
        });
    } else {
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === "") {
                cleaned[key] = undefined;
            }
        });
    }

    return cleaned;
};

/**
 * Resolves an array of Business Unit Identifiers to MongoDB ObjectIds.
 * Useful when a field stores multiple BUs (like User.businessUnits array).
 * 
 * @param identifiers - Array of BU IDs or Slugs
 * @returns Promise<mongoose.Types.ObjectId[]>
 */
export const resolveBusinessUnitIds = async (identifiers: (string | mongoose.Types.ObjectId)[]): Promise<mongoose.Types.ObjectId[]> => {
    if (!identifiers || !Array.isArray(identifiers)) return [];

    const resolved: mongoose.Types.ObjectId[] = [];
    const BusinessUnit = mongoose.models['BusinessUnit'] || mongoose.model("BusinessUnit");

    for (const identifier of identifiers) {
        if (identifier instanceof mongoose.Types.ObjectId) {
            resolved.push(identifier);
            continue;
        }

        const idStr = identifier.toString().trim();
        const isObjectId = mongoose.Types.ObjectId.isValid(idStr) && /^[0-9a-fA-F]{24}$/.test(idStr);

        if (isObjectId) {
            resolved.push(new mongoose.Types.ObjectId(idStr));
        } else {
            // It's a slug or custom ID, search for it
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: idStr }, { slug: idStr }]
            });
            if (buDoc) resolved.push(buDoc._id);
            // Skip if not found (instead of throwing, to be lenient with arrays)
        }
    }

    return resolved;
};

