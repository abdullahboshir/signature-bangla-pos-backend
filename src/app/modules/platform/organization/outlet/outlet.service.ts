import type { IOutlet } from "./outlet.interface.ts";
import { Outlet } from "./outlet.model.ts";
import { Types, model } from "mongoose";
// import ApiError from "../../../../errors/ApiError.js";

const createOutlet = async (payload: IOutlet): Promise<IOutlet> => {
    const BusinessUnit = model("BusinessUnit");

    // Resolve Business Unit ID if it's a string (ULID) or Slug
    if (typeof payload.businessUnit === 'string' && !Types.ObjectId.isValid(payload.businessUnit)) {
        const identifier = (payload.businessUnit as string).trim();
        const bu = await BusinessUnit.findOne({
            $or: [{ id: identifier }, { slug: identifier }]
        });
        if (!bu) {
            throw new Error(`Business Unit not found with the provided ID or Slug: '${identifier}'`);
        }
        payload.businessUnit = bu._id as Types.ObjectId;
    }

    // Check if code exists in the same business unit
    if (payload.code) {
        const isExist = await Outlet.isCodeTaken(payload.code, payload.businessUnit.toString());
        if (isExist) {
            throw new Error("Outlet code already exists in this Business Unit");
        }
    } else {
        // Auto-generate code if not provided
        // Pattern: [NAME_PREFIX]-[SEQ] (e.g. DHM-01)
        const namePrefix = payload.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "OUT");
        let sequence = 1;
        let generatedCode = `${namePrefix}-${String(sequence).padStart(2, '0')}`;

        while (await Outlet.isCodeTaken(generatedCode, payload.businessUnit.toString())) {
            sequence++;
            generatedCode = `${namePrefix}-${String(sequence).padStart(2, '0')}`;
        }
        payload.code = generatedCode;
    }

    const result = await Outlet.create(payload);
    return result;
};

const getAllOutlets = async (businessUnitId: string): Promise<IOutlet[]> => {
    let query: any = {};

    // Helper to check if a value is effectively valid
    const isValidId = (id: any) => id && id !== 'undefined' && id !== 'null';

    // Resolve Business Unit ID if it's a string (ULID) or Slug
    if (isValidId(businessUnitId)) {
        if (!Types.ObjectId.isValid(businessUnitId)) {
            const identifier = (businessUnitId as string).trim();
            const BusinessUnit = model("BusinessUnit");
            const bu = await BusinessUnit.findOne({
                $or: [{ id: identifier }, { slug: identifier }]
            });

            if (bu) {
                query.businessUnit = bu._id;
            } else {
                // If invalid ID/Slug passed, assuming we want results for that SPECIFIC invalid ID which are none
                return [];
            }
        } else {
            query.businessUnit = businessUnitId;
        }
    }

    const result = await Outlet.find(query)
        .populate("manager", "name email")
        .populate("businessUnit", "name id")
        .sort({ createdAt: -1 });
    return result;
};

const getOutletById = async (id: string): Promise<IOutlet | null> => {
    const result = await Outlet.findById(id).populate("manager", "name email");
    return result;
};

const updateOutlet = async (id: string, payload: Partial<IOutlet>): Promise<IOutlet | null> => {
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

    const result = await Outlet.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
};

const deleteOutlet = async (id: string): Promise<IOutlet | null> => {
    const result = await Outlet.findByIdAndDelete(id);
    return result;
};

const getOutletStats = async (outletId: string) => {
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
