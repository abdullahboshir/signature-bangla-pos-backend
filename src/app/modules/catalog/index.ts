/**
 * Catalog Module Public API
 * Handling Product Master Data.
 */

// Core Product
export * from './product/domain/product-core/product.interface.ts';
export * from './product/domain/product-core/product.adapter.ts';
// Product model and service are now internal to Catalog

// Shared Product Features (Shared across domains)
export type { InventoryBase, PhysicalProperties, SEOData, TaxConfiguration, BundleProduct, ProductStatus, ProductAttributes, RatingSummary, RatingDistribution, DeliveryOptions } from './product/product-shared/product-shared.interface.ts';
export { InventoryBaseSchema, PhysicalPropertiesSchema, SEOSchema, TaxConfigurationSchema, BundleProductSchema, ProductStatusSchema, ProductAttributesSchema, RatingSummarySchema, DeliveryOptionsSchema } from './product/product-shared/product-shared.model.ts';

// Category
export * from './category/category.interface.ts';
export * from './category/category.model.ts';
export * from './category/category.service.ts';

// Brand
export * from './brand/brand.interface.ts';
export * from './brand/brand.model.ts';
export * from './brand/brand.service.ts';

// Tax
export * from './tax/tax.interface.ts';
export * from './tax/tax.model.ts';
export * from './tax/tax.service.ts';

// Unit
export * from './unit/unit.interface.ts';
export * from './unit/unit.model.ts';
export * from './unit/unit.service.ts';

// Warranty
export * from './warranty/warranty.interface.ts';
export * from './warranty/warranty.model.ts';
export * from './warranty/warranty.service.ts';

// Attribute & Attribute Group
export * from './attribute/attribute.interface.ts';
export * from './attribute/attribute.model.ts';
export * from './attribute/attribute.service.ts';
export * from './attribute-group/attribute-group.interface.ts';
export * from './attribute-group/attribute-group.model.ts';
export * from './attribute-group/attribute-group.service.ts';
