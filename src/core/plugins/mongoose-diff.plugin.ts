import type { Schema, Document } from 'mongoose';
import { ContextService } from '../services/context.service.js';

export function auditDiffPlugin(schema: Schema) {
    // Stage 1: Capture original state before save
    schema.pre('save', function (next) {
        if (!this.isNew) {
            // Store the original document state (using .toObject() to get plain JS object)
            // Mongoose's 'this' inside pre-save refers to the document being saved
            // We can't easily get the "old" version from 'this' if it's already modified in memory.
            // BUT, for 'save', we can use this.$locals to store "what we think implies change" 
            // OR simpler: assume we only diff explicit modifications if we can't fetch from DB.
            // BETTER APPROACH: Use Mongoose's built-in `modifiedPaths()` and `getChanges()`.
            // Even better: For robust diffing, fetch the original from DB if critical, 
            // but that adds overhead.
            // Optimization: Mongoose documents have `this.getChanges()` in newer versions or we can manually check modified paths.

            // Note: In 'pre' save, 'this' already contains new values.
            // Mongoose doesn't keep old values in memory unless we manually track them.
            // However, we can use `modifiedPaths()` to know WHAT changed.
            // To get OLD values, we'd need to fetch, which is expensive.
            // A common compromise: Log "X field changed to Y".

            // Let's rely on Mongoose's modifiedPaths
        }
        next();
    });

    // Stage 2: Calculate diff after save (or before, but let's stick to simple change tracking)
    schema.pre('save', function (next) {
        const doc = this as Document;

        if (doc.isNew) {
            // For creation, log everything? Or just "Created"? 
            // Usually we don't log "diff" for creation, just payload.
            return next();
        }

        const modifiedPaths = doc.modifiedPaths();
        const changes: Record<string, any> = {};

        modifiedPaths.forEach((path) => {
            // Ignore internal fields
            if (path.startsWith('_') || path === 'updatedAt') return;

            // Get new value
            const newValue = doc.get(path);

            // To get EXACT old value without fetching, we can't easily.
            // BUT, we can at least log "Field X changed to Y".
            // If we really want Reference vs New, we need to fetch.
            // Let's start with "Current State" of changed fields.

            changes[path] = newValue;
        });

        if (Object.keys(changes).length > 0) {
            ContextService.addDiff({
                collection: (doc.constructor as any).modelName,
                id: doc._id,
                changes
            });
        }

        next();
    });
}
