import { AuditLog, type IAuditLog } from "@app/modules/platform/system/audit-log/audit-log.model.ts";
import mongoose from "mongoose";

export class AuditService {
    /**
     * Log a system action to the database asynchronously.
     * This is designed to be "Fire and Forget" so it doesn't slow down the main thread.
     */
    static async log(payload: {
        action: string;
        module: IAuditLog['module']; // Enforce type safety
        actor: {
            userId: string;
            role?: string;
            ip?: string;
        };
        target: {
            resource: string;
            resourceId: string;
        };
        businessUnitId: string;
        changes?: Record<string, any>;
        metadata?: Record<string, any>;
        requestPayload?: Record<string, any>;
        responseStatus?: number;
        duration?: number;
    }) {
        try {
            // Validate required inputs minimally
            if (!payload.actor.userId) {
                console.warn('⚠️ [AuditService] Missing userId for audit log', payload);
                return;
            }

            // Determine scope based on businessUnitId
            const isGlobal = !payload.businessUnitId || payload.businessUnitId === 'GLOBAL';
            const isValidObjectId = mongoose.Types.ObjectId.isValid(payload.businessUnitId);

            // Create entry
            const logEntry: Record<string, any> = {
                action: payload.action,
                module: payload.module,
                actor: {
                    userId: payload.actor.userId,
                    role: payload.actor.role || 'unknown',
                    ip: payload.actor.ip || '0.0.0.0'
                },
                target: payload.target,
                scope: isGlobal ? 'GLOBAL' : 'BUSINESS',
                changes: payload.changes,
                metadata: payload.metadata,
                timestamp: new Date()
            };

            // Only set businessUnit if it's a valid ObjectId
            if (isValidObjectId) {
                logEntry['businessUnit'] = payload.businessUnitId;
            }

            // Non-blocking save
            // We consciously don't await this if we want speed, but for data safety we catch errors
            AuditLog.create(logEntry).catch(err => {
                console.error('❌ [AuditService] Failed to persist log:', err.message);
            });

        } catch (error) {
            // Prevent audit failure from crashing the app
            console.error('❌ [AuditService] Critical Error:', error);
        }
    }
}

