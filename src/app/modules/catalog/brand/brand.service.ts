import type { IBrand } from "./brand.interface.ts";
import { Brand } from "./brand.model.ts";

const createBrand = async (payload: IBrand) => {
    const result = await Brand.create(payload);
    return result;
};

const getAllBrands = async (query: any) => {
    const { limit, page, sortBy, sortOrder, searchTerm, fields, ...filters } = query;

    if (searchTerm) {
        filters['name'] = { $regex: searchTerm, $options: 'i' };
    }

    const result = await Brand.find(filters);
    return result;
};

const getBrandById = async (id: string) => {
    const result = await Brand.findById(id);
    return result;
};

const updateBrand = async (id: string, payload: Partial<IBrand>) => {
    const result = await Brand.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteBrand = async (id: string) => {
    const result = await Brand.findByIdAndDelete(id);
    return result;
};

export const BrandService = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
};
