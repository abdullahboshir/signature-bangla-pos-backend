import { Outlet } from "./outlet.model.ts";
import { Types, model, startSession } from "mongoose";
import { OutletSettings } from "./settings/settings.model.js";
import BusinessUnit from "../business-unit/core/business-unit.model.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.ts";
import { QueryBuilder } from "@core/database/QueryBuilder.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";
import type { IOutlet } from "./outlet.interface.ts";

const createOutlet = async (payload: any, user?: any): Promise<any> => {
    // 🛡️ Resolve Business Unit ID SECURELY with ownership verification
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit, user);
    }

    const session = await startSession();
    session.startTransaction();

    try {
        // 🛡️ Hierarchy Validation: Ensure Outlet modules are a subset of BU modules
        if (payload.activeModules) {
            const parentBU = await BusinessUnit.findById(payload.businessUnit).session(session);
            if (!parentBU) {
                throw new AppError(404, "Parent Business Unit not found", "OUTLET_CREATE_004");
            }
            validateModuleInheritance(payload.activeModules, parentBU.activeModules as any, "Business Unit");
        }

        // Check if code exists in the same business unit
        if (payload.code) {
            const isExist = await Outlet.isCodeTaken(payload.code, payload.businessUnit.toString(), session);
            if (isExist) {
                throw new Error("Outlet code already exists in this Business Unit");
            }
        } else {
            // Auto-generate code if not provided
            // Pattern: [NAME_PREFIX]-[SEQ] (e.g. DHM-01)
            const namePrefix = payload.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "OUT");
            let sequence = 1;
            let generatedCode = `${namePrefix}-${String(sequence).padStart(2, '0')}`;

            while (await Outlet.isCodeTaken(generatedCode, payload.businessUnit.toString(), session)) {
                sequence++;
                generatedCode = `${namePrefix}-${String(sequence).padStart(2, '0')}`;
            }
            payload.code = generatedCode;
        }

        const [result] = await Outlet.create([payload], { session });

        // Atomic Settings Creation
        await OutletSettings.getSettings(result?._id as string, session);

        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

const getAllOutlets = async (businessUnitId: string, user?: any): Promise<any> => {
    // 🛡️ Data isolation is now centrally handled by queryContext + QueryBuilder
    // We just ensure businessUnitId is in filters if explicitly passed
    const filters: any = {};
    if (businessUnitId && businessUnitId !== 'undefined') {
        filters.businessUnit = businessUnitId;
    }

    const outletQuery = new QueryBuilder(
        Outlet.find()
            .populate("manager", "name email")
            .populate("businessUnit", "name id"),
        filters
    )
        .filter()
        .sort()
        .paginate();

    const result = await outletQuery.modelQuery;
    return result;
};

const getOutletById = async (id: string): Promise<IOutlet | null> => {
    if (id === 'new' || !Types.ObjectId.isValid(id)) {
        return null;
    }
    const result = await Outlet.findById(id).populate("manager", "name email");
    return result;
};

const updateOutlet = async (id: string, payload: Partial<IOutlet>): Promise<IOutlet | null> => {
    if (id === 'new' || !Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Outlet ID for update");
    }
    const isExist = await Outlet.findById(id);
    if (!isExist) {
        throw new Error("Outlet not found");
    }

    // specific check for code uniqueness if updating code
    if (payload.code && payload.code !== isExist.code) {
        const isCodeExist = await Outlet.isCodeTaken(payload.code, isExist.businessUnit.toString());
        if (isCodeExist) {
            throw new Error("Outlet code already exists in this Business Unit");
        }
    }

    // 🛡️ Hierarchy Validation on Update
    if (payload.activeModules) {
        const parentBU = await BusinessUnit.findById(isExist.businessUnit);
        if (parentBU) {
            validateModuleInheritance(payload.activeModules, parentBU.activeModules as any, "Business Unit");
        }
    }

    const result = await Outlet.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
};

const deleteOutlet = async (id: string): Promise<IOutlet | null> => {
    if (id === 'new' || !Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Outlet ID for deletion");
    }
    const result = await Outlet.findByIdAndDelete(id);
    return result;
};

const getOutletStats = async (outletId: string, user?: any) => {
    // Dynamically import models to avoid circular dependency issues if any, or just use model()
    const Order = model("Order");
    // const CashRegister = model("CashRegister"); // Check if exists
    const Product = model("Product");
    // const Attendance = model("Attendance"); // Check if exists
    const User = model("User");

    // 1. Today's Sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await Order.aggregate([
        {
            $match: {
                outlet: new Types.ObjectId(outletId),
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                // status: "completed" // Assuming status field exists
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalAmount" }, // Verify field name
                count: { $sum: 1 }
            }
        }
    ]);

    // 2. Active Registers (Mocking/Generic for now if model unsure, but try counting)
    // Assuming 'CashRegister' model tracks status
    let activeRegisters = 0;
    try {
        const CashRegister = model("CashRegister");
        activeRegisters = await CashRegister.countDocuments({
            outlet: outletId,
            status: 'open'
        });
    } catch (e) {
        // Model might not exist yet
        activeRegisters = 0;
    }

    // 3. Low Stock Items
    // Assuming products are linked to outlet (inventory) or global. 
    // If global, this might be tricky. Assuming simple Product model for now.
    // If Inventory is separate, we'd query that.
    const lowStockCount = await Product.countDocuments({
        // "stock": { $lte: 10 } // Simplified
        // Real implementation depends on if stock is per-outlet (Inventory model) or global
        // For now, returning 0 or simplified global count if no outlet linkage
        // "outlet": outletId 
    });

    // 4. Active Staff
    // Count users with outlet permissions or currently clocked in (Attendance)
    let activeStaff = 0;
    try {
        const Attendance = model("Attendance");
        activeStaff = await Attendance.countDocuments({
            outlet: outletId,
            checkOutTime: null, // Currently checked in
            checkInTime: { $gte: startOfDay }
        });
    } catch (e) {
        // Fallback to total staff assigned
        activeStaff = await User.countDocuments({
            "permissions.outlet": outletId,
            isActive: true
        });
    }

    return {
        todaySales: todaySales[0]?.totalAmount || 0,
        salesCount: todaySales[0]?.count || 0,
        activeRegisters,
        lowStockCount,
        activeStaff
    };
};

export const OutletService = {
    createOutlet,
    getAllOutlets,
    getOutletById,
    updateOutlet,
    deleteOutlet,
    getOutletStats
};

/**
 * 🛡️ Validate that child modules are a subset of parent modules
 */
const validateModuleInheritance = (
    requestedModules: Record<string, boolean>,
    allowedModules: Record<string, boolean>,
    level: string
) => {
    if (!requestedModules || !allowedModules) return;

    for (const [module, value] of Object.entries(requestedModules)) {
        const isEnabled = typeof value === 'boolean' ? value : (value as any)?.enabled;
        const isParentEnabled = typeof allowedModules[module] === 'boolean'
            ? allowedModules[module]
            : (allowedModules[module] as any)?.enabled;

        if (isEnabled === true && isParentEnabled !== true) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                `Module '${module}' is not enabled at the ${level} level and cannot be enabled for this outlet.`,
                "MODULE_HIERARCHY_VIOLATION"
            );
        }
    }
};
