/**
 * Commerce Module Public API
 * Handling Product Catalog and Sales.
 */

// Catalog - Product has its own index
export * from './catalog/product/index.js';

// Category & Brand
export * from './catalog/category/category.interface.js';
export * from './catalog/category/category.service.js';
export * from './catalog/brand/brand.interface.js';
export * from './catalog/brand/brand.service.js';

// Sales - Order model for reports
export * from './sales/order/order.model.js';

