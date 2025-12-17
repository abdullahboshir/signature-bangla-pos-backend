import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import BusinessUnit from "@app/modules/organization/business-unit/business-unit.model.ts";

/**
 * Middleware to resolve businessUnit ID from request body/query/params
 * transforming slug or string ID into a valid ObjectId.
 */
export const resolveBusinessUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check sources: body.businessUnit, query.businessUnitId, params.businessUnit
        const sources = [
            { source: req.body, key: 'businessUnit' },
            { source: req.query, key: 'businessUnitId' },
            // { source: req.params, key: 'business-unit' } // Params usually need to stay as is for routing, but can attach to req
        ];

        for (const { source, key } of sources) {
            if (source && source[key] && typeof source[key] === 'string') {
                const value = source[key];

                // If it's already a valid ObjectId24 hex string, trust it (or verify existence if strictly needed)
                const isObjectId = mongoose.Types.ObjectId.isValid(value) && /^[0-9a-fA-F]{24}$/.test(value);

                if (!isObjectId) {
                    // Try to find by custom ID or slug
                    const bu = await BusinessUnit.findOne({
                        $or: [{ id: value }, { slug: value }]
                    });

                    if (bu) {
                        source[key] = bu._id; // Replace with ObjectId
                    } else {
                        // If logic dictates it MUST be found if provided:
                        // return next(new AppError(httpStatus.NOT_FOUND, `Business Unit not found: ${value}`));
                        // For now, mirroring controller logic which throws error
                        throw new Error(`Business Unit not found: ${value}`);
                    }
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};
