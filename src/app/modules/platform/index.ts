/**
 * Platform Module Public API
 * Core infrastructure and global services.
 */

// Organization - BusinessUnit (most commonly used)
export * from './organization/business-unit/core/business-unit.interface.js';
export * from './organization/business-unit/core/business-unit.service.js';
export { default as BusinessUnit } from './organization/business-unit/core/business-unit.model.js';

// Staff (interface and model exist, no service)
export * from './staff/staff.interface.js';
export * from './staff/staff.model.js';

// Queue & Automation
export * from './queue/queue.interface.js';
export * from './queue/queue.service.js';

// Other exports can be added as needed when files are confirmed to exist
// Company, Outlet, License, Package modules are available but not currently imported from outside

