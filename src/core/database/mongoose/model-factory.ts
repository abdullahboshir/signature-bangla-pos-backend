/**
 * ============================================================================
 * MODEL FACTORY - Dynamic Model Binding
 * ============================================================================
 * Factory function to get Mongoose models bound to the correct connection.
 * Ensures queries run on the correct database for dedicated tenants.
 * 
 * Usage:
 *   const Product = getModel(req.tenantConnection, 'Product', ProductSchema);
 */

import type { Connection, Model, Schema } from 'mongoose';
import { ConnectionManager } from './connection-manager.ts';
import logger from '@core/utils/logger.ts';

// Cache for compiled models per connection
const modelCache = new Map<string, Map<string, Model<any>>>();

/**
 * Get a model bound to a specific connection.
 * Uses caching to avoid recompiling schemas.
 */
export function getModel<T>(
    connection: Connection | undefined,
    modelName: string,
    schema: Schema<T>
): Model<T> {
    // Use default connection if none provided
    const conn = connection || ConnectionManager.getDefaultConnection();
    const connId = (conn as any).id || 'default';

    // Check cache first
    let connectionModels = modelCache.get(connId);
    if (!connectionModels) {
        connectionModels = new Map();
        modelCache.set(connId, connectionModels);
    }

    let model = connectionModels.get(modelName);
    if (model) {
        return model as Model<T>;
    }

    // Check if model already exists on connection
    if (conn.models[modelName]) {
        model = conn.models[modelName];
    } else {
        // Compile the model on this connection
        model = conn.model<T>(modelName, schema);
        logger.debug(`[MODEL-FACTORY] Compiled ${modelName} on connection ${connId}`);
    }

    connectionModels.set(modelName, model);
    return model as Model<T>;
}

/**
 * Get multiple models at once.
 */
export function getModels(
    connection: Connection | undefined,
    modelConfigs: Array<{ name: string; schema: Schema<any> }>
): Record<string, Model<any>> {
    const models: Record<string, Model<any>> = {};
    for (const config of modelConfigs) {
        models[config.name] = getModel(connection, config.name, config.schema);
    }
    return models;
}

/**
 * Clear model cache for a specific connection.
 * Call this when a connection is closed.
 */
export function clearModelCache(connectionId: string): void {
    modelCache.delete(connectionId);
}

/**
 * Helper to get the appropriate connection for a request.
 * This is a convenience wrapper for use in services.
 */
export function getConnectionFromRequest(req: Express.Request): Connection {
    return (req as any).tenantConnection || ConnectionManager.getDefaultConnection();
}

export default { getModel, getModels, clearModelCache, getConnectionFromRequest };
