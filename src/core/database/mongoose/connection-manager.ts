import mongoose from 'mongoose';
import type { Connection } from 'mongoose';
import appConfig from '@shared/config/app.config.js';
import logger from '@core/utils/logger.ts';

interface ConnectionEntry {
    connection: Connection;
    lastUsed: number;
    organizationId: string;
}

// Connection pool for dedicated tenants
const connectionPool = new Map<string, ConnectionEntry>();

// Default (shared) connection reference
let defaultConnection: Connection | null = null;

// Maximum connections per pool (prevent resource exhaustion)
const MAX_DEDICATED_CONNECTIONS = parseInt(process.env['MAX_DEDICATED_CONNECTIONS'] || '50');

// Connection idle timeout (30 minutes)
const CONNECTION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export class ConnectionManager {
    /**
     * Initialize the default (shared) database connection.
     * Called once during application bootstrap.
     */
    static async initDefaultConnection(): Promise<Connection> {
        if (defaultConnection && defaultConnection.readyState === 1) {
            return defaultConnection;
        }

        try {
            await mongoose.connect(appConfig.db_url as string, {
                maxPoolSize: 10,
            });
            defaultConnection = mongoose.connection;
            logger.info('✅ Default MongoDB connection established');
            return defaultConnection;
        } catch (error) {
            logger.error('❌ Default MongoDB connection failed:', error as Record<string, unknown>);
            throw error;
        }
    }

    /**
     * Get the default (shared) connection.
     */
    static getDefaultConnection(): Connection {
        if (!defaultConnection) {
            throw new Error('Default connection not initialized. Call initDefaultConnection() first.');
        }
        return defaultConnection;
    }

    /**
     * Get or create a connection for a dedicated tenant.
     * Connections are cached and reused.
     */
    static async getConnection(organizationId: string, databaseUri: string): Promise<Connection> {
        // Check if connection already exists and is healthy
        const existing = connectionPool.get(organizationId);
        if (existing && existing.connection.readyState === 1) {
            existing.lastUsed = Date.now();
            return existing.connection;
        }

        // Clean up stale connection if exists
        if (existing) {
            await this.closeConnection(organizationId);
        }

        // Enforce pool size limit
        if (connectionPool.size >= MAX_DEDICATED_CONNECTIONS) {
            await this.evictLeastRecentlyUsed();
        }

        // Create new connection
        try {
            logger.info(`[CONN] Creating dedicated connection for org: ${organizationId}`);
            const connection = await mongoose.createConnection(databaseUri, {
                maxPoolSize: 5,
            }).asPromise();

            connectionPool.set(organizationId, {
                connection,
                lastUsed: Date.now(),
                organizationId
            });

            // Set up error handlers
            connection.on('error', (err) => {
                logger.error(`[CONN] Error on dedicated connection ${organizationId}:`, err);
            });

            connection.on('disconnected', () => {
                logger.warn(`[CONN] Dedicated connection ${organizationId} disconnected`);
                connectionPool.delete(organizationId);
            });

            return connection;
        } catch (error) {
            logger.error(`[CONN] Failed to create dedicated connection for ${organizationId}:`, error as Record<string, unknown>);
            throw error;
        }
    }

    /**
     * Close a specific tenant connection.
     */
    static async closeConnection(organizationId: string): Promise<void> {
        const entry = connectionPool.get(organizationId);
        if (entry) {
            try {
                await entry.connection.close();
                connectionPool.delete(organizationId);
                logger.info(`[CONN] Closed dedicated connection for: ${organizationId}`);
            } catch (error) {
                logger.error(`[CONN] Error closing connection ${organizationId}:`, error as Record<string, unknown>);
            }
        }
    }

    /**
     * Evict the least recently used connection to make room for new ones.
     */
    private static async evictLeastRecentlyUsed(): Promise<void> {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        connectionPool.forEach((entry, key) => {
            if (entry.lastUsed < oldestTime) {
                oldestTime = entry.lastUsed;
                oldestKey = key;
            }
        });

        if (oldestKey) {
            logger.info(`[CONN] Evicting LRU connection: ${oldestKey}`);
            await this.closeConnection(oldestKey);
        }
    }

    /**
     * Clean up idle connections (called periodically).
     */
    static async cleanupIdleConnections(): Promise<void> {
        const now = Date.now();
        const toClose: string[] = [];

        connectionPool.forEach((entry, key) => {
            if (now - entry.lastUsed > CONNECTION_IDLE_TIMEOUT_MS) {
                toClose.push(key);
            }
        });

        for (const key of toClose) {
            await this.closeConnection(key);
        }

        if (toClose.length > 0) {
            logger.info(`[CONN] Cleaned up ${toClose.length} idle connections`);
        }
    }

    /**
     * Graceful shutdown - close all connections.
     */
    static async shutdown(): Promise<void> {
        logger.info('[CONN] Shutting down all connections...');

        // Close all dedicated connections
        const closePromises = Array.from(connectionPool.keys()).map(key =>
            this.closeConnection(key)
        );
        await Promise.all(closePromises);

        // Close default connection
        if (defaultConnection) {
            await defaultConnection.close();
            defaultConnection = null;
        }

        logger.info('[CONN] All connections closed');
    }

    /**
     * Get pool statistics for monitoring.
     */
    static getPoolStats(): {
        defaultStatus: string;
        dedicatedConnections: number;
        maxConnections: number;
    } {
        return {
            defaultStatus: defaultConnection?.readyState === 1 ? 'connected' : 'disconnected',
            dedicatedConnections: connectionPool.size,
            maxConnections: MAX_DEDICATED_CONNECTIONS
        };
    }
}

// Schedule periodic cleanup (every 10 minutes)
setInterval(() => {
    ConnectionManager.cleanupIdleConnections().catch(err => {
        logger.error('[CONN] Cleanup error:', err);
    });
}, 10 * 60 * 1000);

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await ConnectionManager.shutdown();
});

process.on('SIGINT', async () => {
    await ConnectionManager.shutdown();
    process.exit(0);
});

export default ConnectionManager;
