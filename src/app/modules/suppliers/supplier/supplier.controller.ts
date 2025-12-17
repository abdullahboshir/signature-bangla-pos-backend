import { GenericController } from "../../../../core/controllers/GenericController.ts";
import {
    createSupplierService,
    getAllSuppliersService,
    getSupplierByIdService,
    updateSupplierService,
    deleteSupplierService
} from "./supplier.service.ts";

const supplierService = {
    create: createSupplierService,
    getAll: getAllSuppliersService,
    getById: getSupplierByIdService,
    update: updateSupplierService,
    delete: deleteSupplierService
};

export const SupplierController = new GenericController(supplierService, "Supplier");
