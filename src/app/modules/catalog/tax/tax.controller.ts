import { TaxService } from "./tax.service.ts";
import { GenericController } from "@core/controllers/GenericController.ts";
import type { ITax } from "./tax.interface.ts";

const genericTaxController = new GenericController<ITax>(TaxService, "Tax");

export const TaxController = {
    createTax: genericTaxController.create,
    getAllTaxes: genericTaxController.getAll,
    getTaxById: genericTaxController.getById,
    updateTax: genericTaxController.update,
    deleteTax: genericTaxController.delete,
};
