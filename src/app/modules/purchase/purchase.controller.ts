import { GenericController } from "../../../core/controllers/GenericController.ts";
import { ApiResponse } from "../../../core/utils/api-response.ts";
import httpStatus from "http-status";
import {
    createPurchaseService,
    getAllPurchasesService,
    getPurchaseByIdService,
    updatePurchaseService,
    deletePurchaseService
} from "./purchase.service.ts";

const purchaseService = {
    create: createPurchaseService,
    getAll: getAllPurchasesService,
    getById: getPurchaseByIdService,
    update: updatePurchaseService,
    delete: deletePurchaseService
};

// Create a generic controller instance
const genericController = new GenericController(purchaseService, "Purchase");

// Export a custom controller object that overrides create but delegates others
export const PurchaseController = {
    getAll: genericController.getAll,
    getById: genericController.getById,
    update: genericController.update,
    delete: genericController.delete,

    create: async (req: any, res: any, next: any) => {
        try {
            const user = req.user; // Assumes auth middleware populates this
            const result = await purchaseService.create(req.body, user);
            ApiResponse.success(
                res,
                result,
                `Purchase created successfully`,
                httpStatus.CREATED
            );
        } catch (error) {
            next(error);
        }
    }
};
