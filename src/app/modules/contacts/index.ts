/**
 * Contacts Module Public API
 * Customer and Supplier relationship management.
 */

// Customers
export * from './customers/customer.interface.js';
export * from './customers/customer.service.js';
export { default as Customer } from './customers/customer.model.js';
export * from './customers/customer.validation.js';

// Suppliers - Not currently used cross-module
// export * from './suppliers/supplier.interface.js';
// export * from './suppliers/supplier.service.js';

