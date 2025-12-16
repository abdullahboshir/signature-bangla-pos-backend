import { startSession, Types } from "mongoose";
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
import { ProductVariant } from "../product-variant/product-variant.model.js";
import { Product } from "./product-core.model.js";

const mapFrontendToBackendVariant = (frontendVariant: any, parentId: string, parentSku: string) => {
  // Convert options array [{name, value}] to Map/Object for attributes
  const attributesMap: any = {};
  if (Array.isArray(frontendVariant.options)) {
    frontendVariant.options.forEach((opt: any) => {
      if (opt.name && opt.value) {
        attributesMap[opt.name] = opt.value;
      }
    });
  }

  return {
    variantId: frontendVariant.id || new Types.ObjectId().toString(),
    parentProduct: parentId,
    sku: frontendVariant.sku || `${parentSku}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    attributes: attributesMap,
    pricing: {
      basePrice: frontendVariant.price || 0,
      salePrice: frontendVariant.price || 0, // Default sale to base
      costPrice: 0, // Frontend doesn't provide cost for variants yet? Default to 0 or inherit?
      currency: "BDT"
    },
    inventory: {
      stock: frontendVariant.stock || 0,
      allowBackorder: false
    },
    images: frontendVariant.images && Array.isArray(frontendVariant.images) ? frontendVariant.images : (frontendVariant.image ? [frontendVariant.image] : []),
    isDefault: frontendVariant.isDefault || false,
    status: "active"
  };
};

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

    // 2.1 Generate Product ID upfront
    const productId = new Types.ObjectId();

    // 3. Create Sub-documents first

    // a. Pricing
    const pricing = await ProductPricing.create([{ ...payload.pricing, product: productId }], { session });

    // b. Inventory
    const inventory = await ProductInventory.create([{ ...payload.inventory, product: productId }], { session });

    // c. Details
    // @ts-ignore
    const details = await ProductDetails.create([{ ...payload.details, product: productId }], { session });

    // d. Shipping
    const shipping = await ProductShipping.create([{ ...payload.shipping, product: productId }], { session });

    // e. Warranty
    const warranty = await ProductWarrantyReturn.create([{ ...payload.warranty, product: productId }], { session });

    // f. Variants (If enabled)
    let variantTemplateId = undefined;
    if (payload.hasVariants) {
      const mappedVariants = (payload.variants || []).map((v: any) =>
        mapFrontendToBackendVariant(v, productId.toString(), productSku)
      );

      const variantData = {
        product: productId,
        hasVariants: true,
        variants: mappedVariants,
        variantAttributes: payload.variantAttributes || [] // Preserved if sent
      };

      const productVariant = await ProductVariant.create([variantData], { session });
      variantTemplateId = productVariant[0]?._id;
    }

    // 4. Create Product with references
    const productPayload = {
      ...payload,
      _id: productId,
      sku: productSku,
      pricing: pricing[0]?._id,
      inventory: inventory[0]?._id,
      details: details[0]?._id, // @ts-ignore
      shipping: shipping[0]?._id,
      warranty: warranty[0]?._id,
      variantTemplate: variantTemplateId
    };

    const product = await Product.create([productPayload], { session });

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

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { sku: searchRegex },
    ];
  }

  // Add other filters as needed
  return await productRepository.findAll(filter);
}


export const getProductByIdService = async (id: string) => {
  return await productRepository.findById(id);
}

export const updateProductService = async (id: string, payload: any) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    // Update Sub-documents
    if (payload.pricing && product.pricing) {
      await ProductPricing.findByIdAndUpdate(product.pricing, payload.pricing, { session });
    }

    if (payload.inventory && product.inventory) {
      // Handle inventory logic if needed (e.g. stock adjustment), here just updating fields
      await ProductInventory.findByIdAndUpdate(product.inventory, payload.inventory, { session });
    }

    if (payload.details && product.details) {
      await ProductDetails.findByIdAndUpdate(product.details, payload.details, { session });
    }

    if (payload.shipping && product.shipping) {
      await ProductShipping.findByIdAndUpdate(product.shipping, payload.shipping, { session });
    }

    if (payload.warranty && product.warranty) {
      await ProductWarrantyReturn.findByIdAndUpdate(product.warranty, payload.warranty, { session });
    }

    // Update Variants logic
    if (payload.hasVariants !== undefined || payload.variants) {
      // Map variants using helper
      const mappedVariants = (payload.variants || []).map((v: any) =>
        mapFrontendToBackendVariant(v, id, product.sku)
      );

      if (product.variantTemplate) {
        const variantUpdatePayload: any = {};
        if (payload.variants) {
          variantUpdatePayload.variants = mappedVariants;
        }
        if (payload.variantAttributes) {
          variantUpdatePayload.variantAttributes = payload.variantAttributes;
        }

        await ProductVariant.findByIdAndUpdate(product.variantTemplate, variantUpdatePayload, { session });
      } else if (payload.hasVariants && payload.variants) {
        const variantData = {
          product: id,
          hasVariants: true,
          variants: mappedVariants,
          variantAttributes: payload.variantAttributes || []
        };
        const newVariant = await ProductVariant.create([variantData], { session });
        payload.variantTemplate = newVariant[0]?._id;
      }
    }

    // Update Main Product
    // Remove complex fields from payload before updating Product to avoid cast errors
    // Also remove 'variants' array as it's not on the main schema directly (it uses variantTemplate ref)
    const { pricing, inventory, details, shipping, warranty, variants, variantAttributes, ...productData } = payload;

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true, session });

    await session.commitTransaction();
    session.endSession();
    return updatedProduct;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export const deleteProductService = async (id: string) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    // Delete sub-documents
    if (product.pricing) await ProductPricing.findByIdAndDelete(product.pricing, { session });
    if (product.inventory) await ProductInventory.findByIdAndDelete(product.inventory, { session });
    if (product.details) await ProductDetails.findByIdAndDelete(product.details, { session });
    if (product.shipping) await ProductShipping.findByIdAndDelete(product.shipping, { session });
    if (product.warranty) await ProductWarrantyReturn.findByIdAndDelete(product.warranty, { session });
    if (product.variantTemplate) await ProductVariant.findByIdAndDelete(product.variantTemplate, { session });

    // Delete Product
    await Product.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();
    return { message: "Product deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
