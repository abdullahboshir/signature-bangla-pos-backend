import { Product } from "./product.model.ts";
import type { IProductContract } from "@app/core/contracts/module.contracts.ts";
import { deleteProductService } from "./product.service.ts";

/**
 * Catalog Product Adapter
 * Provides a standardized way for other modules to access Product data
 * without depending on the internal Mongoose model structure.
 */
export class CatalogProductAdapter {
    /**
     * Maps a Mongoose Product document to the IProductContract shape.
     */
    private static mapToContract(product: any): IProductContract {
        return {
            id: product._id.toString(),
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            price: {
                base: product.pricing?.basePrice || 0,
                sale: product.pricing?.salePrice || 0,
                currency: product.pricing?.currency || "BDT"
            },
            stock: {
                total: product.inventory?.totalStock || 0,
                isAvailable: (product.inventory?.totalStock || 0) > 0
            },
            category: {
                id: product.primaryCategory?._id?.toString() || "",
                name: product.primaryCategory?.name || ""
            },
            images: product.images || [],
            availableModules: product.availableModules || []
        };
    }

    /**
     * Fetch a product by ID and map to contract.
     */
    static async getProductById(id: string): Promise<IProductContract | null> {
        const product = await Product.findById(id)
            .populate('pricing')
            .populate('inventory')
            .populate('primaryCategory')
            .lean();

        if (!product) return null;
        return this.mapToContract(product);
    }

    /**
     * Fetch a product by SKU/Barcode and map to contract.
     */
    static async getProductByIdentity(identifier: string): Promise<IProductContract | null> {
        const product = await Product.findOne({
            $or: [{ sku: identifier }, { barcode: identifier }]
        })
            .populate('pricing')
            .populate('inventory')
            .populate('primaryCategory')
            .lean();

        if (!product) return null;
        return this.mapToContract(product);
    }

    /**
     * Search products based on filter and return contracts.
     */
    static async searchProducts(filter: any, limit: number = 10): Promise<IProductContract[]> {
        const products = await Product.find(filter)
            .populate('pricing')
            .populate('inventory')
            .populate('primaryCategory')
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        return products.map((p: any) => this.mapToContract(p));
    }

    /**
     * [Maintenance/Platform Use Only] 
     * Identify and return products marked for deletion before the cutoff date.
     */
    static async getProductsForCleanup(cutoffDate: Date): Promise<any[]> {
        return await Product.find({
            isDeleted: true,
            deletedAt: { $lt: cutoffDate }
        }).lean();
    }

    /**
     * [Maintenance/Platform Use Only]
     * Perform deep deletion of a product.
     */
    static async deepDeleteProduct(productId: string): Promise<void> {
        await deleteProductService(productId, true);
    }

    /**
     * [Reporting Use Only]
     * Execute stock valuation aggregation.
     */
    static async getStockValuationData(matchStage: any): Promise<any[]> {
        return await Product.aggregate([
            { $match: matchStage },
            {
                $project: {
                    name: 1,
                    sku: 1,
                    stock: "$inventory.stock",
                    costPrice: "$pricing.costPrice",
                    sellingPrice: "$pricing.sellingPrice",
                    totalCostValue: { $multiply: ["$inventory.stock", "$pricing.costPrice"] },
                    totalRetailValue: { $multiply: ["$inventory.stock", "$pricing.sellingPrice"] }
                }
            },
            { $sort: { totalCostValue: -1 } }
        ]);
    }
}
