import { startSession } from "mongoose";
import AppError from "@shared/errors/app-error.ts";
import { Category } from "../../category/category.model.js";
import type { IProductCore } from "./product-core.interface.js";
import { generateProductCode } from "./product-core.utils.js";
import { ProductRepository } from "./product-core.repository.ts";
import { ProductPricing } from "../product-pricing/product-pricing.model.js";
import { ProductInventory } from "../product-inventory/product-inventory.model.js";
import { ProductDetails } from "../product-details/product-details.model.js";
import { ProductShipping } from "../product-shipping/product-shipping.model.js";
import { ProductWarrantyReturn } from "../product-warranty-return/product-warranty-return.model.js";
import { Product } from "./product-core.model.js";

const productRepository = new ProductRepository();

export const createProductService = async (payload: any) => {
  const session = await startSession();
  session.startTransaction();

  try {
    // 1. Validate Category to generate SKU prefix
    const category = await Category.findOne({ _id: payload?.primaryCategory || payload?.categories?.[0] });
    if (!category) {
      throw new AppError(404, 'Category not found!');
    }

    // 2. Generate SKU
    const productSku = await generateProductCode(category?.name ? category?.name : 'others', payload?.origine);

    // 3. Create Sub-documents first

    // a. Pricing
    const pricing = await ProductPricing.create([{ ...payload.pricing }], { session });

    // b. Inventory
    const inventory = await ProductInventory.create([{ ...payload.inventory }], { session });

    // c. Details
    const details = await ProductDetails.create([{ ...payload.details }], { session });

    // d. Shipping
    const shipping = await ProductShipping.create([{ ...payload.shipping }], { session });

    // e. Warranty
    const warranty = await ProductWarrantyReturn.create([{ ...payload.warranty }], { session });

    // 4. Create Product with references
    const productPayload = {
      ...payload,
      sku: productSku,
      pricing: pricing[0]._id,
      inventory: inventory[0]._id,
      details: details[0]._id,
      shipping: shipping[0]._id,
      warranty: warranty[0]._id
    };

    const product = await Product.create([productPayload], { session });

    // 5. Update reverse references (if schema required unique one-to-one, we update subs to point to product)
    // The schemas (Pricing, Inventory) have `product: { required: true }`. 
    // Wait, if they require `product` ID, we can't create them BEFORE the product!
    // We must generate an ID first or create Product first? 
    // Actually, circular dependency in Mongoose is tricky.
    // Models:
    // ProductPricing: product (required)
    // ProductInventory: product (required)

    // Strategy: Generate Product ID first without saving?
    // Or create Product first with nulls (if allowed)?
    // Inspect Schemas:
    // Product: required: pricing, inventory, etc.
    // Pricing: required: product.
    // This is a strict toggle.

    // We need to generate the _id for product first.
    product[0].set('pricing', pricing[0]._id);
    product[0].set('inventory', inventory[0]._id);
    product[0].set('details', details[0]._id);
    product[0].set('shipping', shipping[0]._id);
    product[0].set('warranty', warranty[0]._id);

    // Update subs with product ID
    pricing[0].set('product', product[0]._id);
    inventory[0].set('product', product[0]._id);
    details[0].set('product', product[0]._id);
    shipping[0].set('product', product[0]._id);
    warranty[0].set('product', product[0]._id);

    // Save all
    await pricing[0].save({ session });
    await inventory[0].save({ session });
    await details[0].save({ session });
    await shipping[0].save({ session });
    await warranty[0].save({ session });
    await product[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    return product[0];

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export const getAllProductsService = async (query: any) => {
  const filter: any = {};
  if (query.businessUnit) {
    filter.businessUnit = query.businessUnit;
  }
  // Add other filters as needed
  return await productRepository.findAll(filter);
}

