import { GenericController } from "../../../../core/controllers/GenericController.ts";
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

export const PurchaseController = new GenericController(purchaseService, "Purchase");
