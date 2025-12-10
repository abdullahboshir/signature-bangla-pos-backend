import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import status from "http-status";
import { User } from "./user.model.ts";
import mongoose from "mongoose";

export const createUserController = catchAsync(async (req, res) => {
    const userData = req.body;

    console.log("=== CREATE USER DEBUG ===");
    console.log("Received userData:", JSON.stringify(userData, null, 2));

    // Generate unique user ID if not provided
    if (!userData.id) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        userData.id = `USER_${timestamp}_${random}`.toUpperCase();
    }

    // Resolve businessUnits from slugs/IDs to ObjectIds
    if (userData.businessUnits && Array.isArray(userData.businessUnits)) {
        const BusinessUnit = mongoose.model("BusinessUnit");
        const resolvedUnits = [];

        for (const unit of userData.businessUnits) {
            console.log(`Checking business unit: ${unit}`);

            // Check if it's already an ObjectId
            const isObjectId = mongoose.Types.ObjectId.isValid(unit) && /^[0-9a-fA-F]{24}$/.test(unit);

            if (isObjectId) {
                console.log(`  → Already ObjectId: ${unit}`);
                resolvedUnits.push(unit);
            } else {
                // Look up by id or slug
                const buDoc = await BusinessUnit.findOne({
                    $or: [{ id: unit }, { slug: unit }]
                });

                if (buDoc) {
                    console.log(`  → Found BU: ${buDoc.name} (${buDoc.id}) → ObjectId: ${buDoc._id}`);
                    resolvedUnits.push(buDoc._id);
                } else {
                    console.log(`  → NOT FOUND for: ${unit}`);
                }
            }
        }

        console.log("Resolved business units:", resolvedUnits);
        userData.businessUnits = resolvedUnits;
    }

    console.log("Final userData before create:", JSON.stringify(userData, null, 2));

    // Create user
    const newUser = await User.create(userData);

    console.log("Created user with businessUnits:", newUser.businessUnits);
    console.log("=== END DEBUG ===");

    ApiResponse.success(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User created successfully",
        data: newUser,
    });
});
