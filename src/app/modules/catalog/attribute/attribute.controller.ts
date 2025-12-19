import { GenericController } from "@core/controllers/GenericController.ts";
import httpStatus from "http-status";
import { ApiResponse } from "@core/utils/api-response.ts";
import {
    createAttributeService,
    getAllAttributesService,
    getAttributeByIdService,
    updateAttributeService,
    deleteAttributeService
} from "./attribute.service.js";

const attributeServiceMap = {
    create: createAttributeService,
    getAll: getAllAttributesService,
    getById: getAttributeByIdService,
    update: updateAttributeService,
    delete: deleteAttributeService
};

class AttributeGenericController extends GenericController<any> {
    override create = async (req: any, res: any, next: any) => { // Use explicit next for error handling
        try {
            // Inject Business Unit from User
            if (req.user && req.user.businessUnits && req.user.businessUnits.length > 0) {
                // Assuming user belongs to at least one BU, use the first one 
                // or you might want to pick one from params if in a specific BU context
                // For now, simpler: use the first one
                req.body.businessUnit = req.user.businessUnits[0];
            } else {
                // Fallback or Error? 
                // If Super Admin with no explicit BU, what happens? 
                // Attributes are usually BU specific.
                // Let's assume req.user.businessUnits is populated.
            }

            // Call parent create
            const result = await createAttributeService(req.body);
            ApiResponse.success(
                res,
                result,
                "Attribute created successfully",
                httpStatus.CREATED
            );
        } catch (error) {
            next(error);
        }
    };
}

export const AttributeController = new AttributeGenericController(attributeServiceMap, "Attribute");
