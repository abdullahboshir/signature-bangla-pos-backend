import { Product } from "./product-core.model.ts";
import type { IProductDocument } from "./product-core.interface.ts";
import type { FilterQuery } from "mongoose";

export class ProductRepository {
    async create(data: Partial<IProductDocument>): Promise<IProductDocument> {
        return await Product.create(data);
    }

    async findAll(filter: FilterQuery<IProductDocument> = {}): Promise<IProductDocument[]> {
        return await Product.find(filter)
            .populate('businessUnit')
            .populate('primaryCategory')
            .populate('pricing')
            .populate('inventory')
            .populate('details') // Needed for images
            .populate('unit')
            .populate('brands');
    }

    async findById(id: string): Promise<IProductDocument | null> {
        return await Product.findById(id)
            .populate('businessUnit')
            .populate('primaryCategory')
            .populate('pricing')
            .populate('inventory')
            .populate('details')
            .populate('brands')
            .populate('shipping')
            .populate('unit')
            .populate('variantTemplate');
    }

    async update(id: string, data: Partial<IProductDocument>): Promise<IProductDocument | null> {
        return await Product.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IProductDocument | null> {
        return await Product.findByIdAndDelete(id);
    }

    async findByBusinessUnit(businessUnitId: string): Promise<IProductDocument[]> {
        return await Product.find({ businessUnit: businessUnitId })
            .populate('businessUnit')
            .populate('primaryCategory')
            .populate('pricing')
            .populate('inventory')
            .populate('details')
            .populate('unit')
            .populate('brands');
    }
}
