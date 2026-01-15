import mongoose from "mongoose";
import AppError from "@shared/errors/app-error.ts";


export const resolveBusinessUnitId = async (
    identifier: string | mongoose.Types.ObjectId | undefined | null,
    verifiedUser?: any
): Promise<mongoose.Types.ObjectId | undefined> => {
    console.log("before       Verified User:", verifiedUser, identifier);
    if (!identifier) return undefined;

    const BusinessUnit = mongoose.models['BusinessUnit'] || mongoose.model("BusinessUnit");
    let resolvedId: mongoose.Types.ObjectId | null = null;

    if (identifier instanceof mongoose.Types.ObjectId) {
        resolvedId = identifier;
    } else {
        const idStr = identifier.toString().trim();
        const isObjectId = mongoose.Types.ObjectId.isValid(idStr) && /^[0-9a-fA-F]{24}$/.test(idStr);

        if (isObjectId) {
            resolvedId = new mongoose.Types.ObjectId(idStr);
        } else {
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: idStr }, { slug: idStr }]
            }).select('_id').lean();

            if (!buDoc) {
                throw new AppError(404, `Business Unit Not Found: '${idStr}'`);
            }
            resolvedId = (buDoc as any)._id as mongoose.Types.ObjectId;
        }
    }

    if (!resolvedId) return undefined;

    console.log("Verified User:", verifiedUser, identifier);
    // 🛡️ SECURITY LAYER: Ownership Verification
    if (verifiedUser && !verifiedUser.roleName?.includes('super-admin') && !verifiedUser.isSuperAdmin && !verifiedUser.roleName?.includes('company-owner')) {
        const authorizedBUs = verifiedUser.businessUnits || [];
        const hasAccess = authorizedBUs.some((bu: any) => (bu._id?.toString() || bu.toString()) === resolvedId!.toString());

        if (!hasAccess) {
            throw new AppError(403, "Ownership Security Error: You do not have permission for this Business Unit.");
        }
    }

    return resolvedId;
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

