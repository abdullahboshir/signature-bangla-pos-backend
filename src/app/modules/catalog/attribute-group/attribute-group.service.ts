import type { IAttributeGroup } from "./attribute-group.interface.ts";
import { AttributeGroup } from "./attribute-group.model.js";


const createAttributeGroup = async (payload: IAttributeGroup) => {
    const result = await AttributeGroup.create(payload);
    return result;
};

const getAllAttributeGroups = async () => {
    const result = await AttributeGroup.find({ isActive: true });
    return result;
};

const getAttributeGroupById = async (id: string) => {
    const result = await AttributeGroup.findById(id);
    return result;
};

const updateAttributeGroup = async (id: string, payload: Partial<IAttributeGroup>) => {
    const result = await AttributeGroup.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

const deleteAttributeGroup = async (id: string) => {
    const result = await AttributeGroup.findByIdAndDelete(id);
    return result;
};

export const AttributeGroupService = {
    createAttributeGroup,
    getAllAttributeGroups,
    getAttributeGroupById,
    updateAttributeGroup,
    deleteAttributeGroup
};
