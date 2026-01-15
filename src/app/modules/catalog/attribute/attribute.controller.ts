import { GenericController } from "@core/controllers/GenericController.ts";
import httpStatus from "http-status";
import { ApiResponse } from "@core/utils/api-response.ts";
import {
    createAttributeService,
    getAllAttributesService,
    getAttributeByIdService,
    updateAttributeService,
    deleteAttributeService
} from "./attribute.service.ts";

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
            // Do NOT forcefully inject Business Unit here.
            // The frontend sends `null` for Global or a specific ID for Scoped.
            // If we force `req.user.businessUnits[0]`, we break Global creation for Super Admins.

            // (Optional) You might want to validate here that if the user is NOT a Super Admin,
            // they are not trying to create a Global (null) attribute.
            // But for now, removing the override solves the user's reported bug.

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
