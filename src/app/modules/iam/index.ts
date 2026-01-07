/**
 * IAM Module Public API
 * Only imports from this file are allowed by other modules.
 */

// User
export * from './user/user.interface.js';
export * from './user/user.service.js';
export * from './user/user.model.js';

// Role
export * from './role/role.interface.js';
export * from './role/role.service.js';
export * from './role/role.model.js';

// Auth
export * from './auth/auth.interface.js';
// export * from './auth/auth.service.js'; // Usually Auth service is internal or middleware used

// Constants
export * from './user/user.constant.js';
export * from './role/role.constant.js';
export * from './permission/permission.constant.js';
