import { ProductInventory } from "./product-inventory.model.ts";


import { Product } from "../product-core/product-core.model.js";

export const getAllStockLevelsService = async (_query: Record<string, unknown>) => {
    // Aggregation to fetch ALL products + their inventory status
    const inventory = await Product.aggregate([
        {
            $lookup: {
                from: 'productinventories', // Mongoose default collection name for ProductInventory
                localField: '_id',
                foreignField: 'product',
                as: 'inventoryData'
            }
        },
        {
            $unwind: {
                path: '$inventoryData',
                preserveNullAndEmptyArrays: true
            }
        },
        // Populate Category
        {
            $lookup: {
                from: 'categories',
                localField: 'categories.0', // Note: categories is an array of ObjectIds in Product model
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        // Populate Brand
        {
            $lookup: {
                from: 'brands',
                localField: 'brands.0', // Note: brands is an array
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        // Populate Unit
        {
            $lookup: {
                from: 'units',
                localField: 'unit',
                foreignField: '_id',
                as: 'unit'
            }
        },
        { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                product: {
                    _id: '$_id',
                    name: '$name',
                    sku: '$sku',
                    category: { name: '$category.name' },
                    brand: { name: '$brand.name' },
                    unit: { name: '$unit.name' }
                },
                inventory: {
                    $ifNull: ['$inventoryData.inventory', {
                        stock: 0,
                        reserved: 0,
                        sold: 0,
                        stockStatus: 'out_of_stock',
                        lowStockThreshold: 10 // Default
                    }]
                },
                status: { $ifNull: ['$inventoryData.inventory.stockStatus', 'out_of_stock'] }
            }
        },
        { $sort: { 'inventory.stock': -1 } }
    ]);

    // console.log("Aggregation result count:", inventory.length);

    return inventory;
};

export const getProductStockLevelService = async (productId: string) => {
    const inventory = await ProductInventory.findOne({ product: productId })
        .populate('product', 'name sku')
        .populate('outletStock.outlet', 'name address'); // Populate outlet names
    return inventory;
};
