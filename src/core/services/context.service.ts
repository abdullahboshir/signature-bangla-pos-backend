import { AsyncLocalStorage } from 'async_hooks';

export interface IAuditContext {
    diffs: Record<string, any>[]; // Array of diff objects from various models
    validationErrors: string[];
    customMetadata: Record<string, any>;
}

export class ContextService {
    private static storage = new AsyncLocalStorage<IAuditContext>();

    /**
     * Initialize the context for a new request
     */
    static run(callback: () => void) {
        const initialStore: IAuditContext = {
            diffs: [],
            validationErrors: [],
            customMetadata: {}
        };
        this.storage.run(initialStore, callback);
    }

    /**
     * Get the current context store
     */
    static getStore(): IAuditContext | undefined {
        return this.storage.getStore();
    }

    /**
     * Add a data diff to the current context
     */
    static addDiff(diff: Record<string, any>) {
        const store = this.getStore();
        if (store) {
            store.diffs.push(diff);
        }
    }

    /**
     * Add an error message to the current context
     */
    static addError(error: string) {
        const store = this.getStore();
        if (store) {
            store.validationErrors.push(error);
        }
    }

    /**
     * Retrieve all accumulated diffs
     */
    static getDiffs() {
        return this.getStore()?.diffs || [];
    }

    /**
     * Retrieve all accumulated errors
     */
    static getErrors() {
        return this.getStore()?.validationErrors || [];
    }
}
