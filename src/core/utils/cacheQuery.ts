// src/utils/cacheQuery.ts

import { Query, Document, Schema } from 'mongoose';
import { CacheManager } from '../caching/cache-manager.js';


const cacheActiveQueries = new Map<string, { key: string; ttlSeconds?: number | undefined }>();

interface SchemaQuery {
  cache: (key: string, ttlSeconds?: number) => Query<any, any>;
};


export function cacheQuery<T extends Document>(
  this: Query<T, T>,
  key?: string,
  ttlSeconds?: number
) {
  const safeKey = key ?? '';
  this.setOptions({ cacheKey: safeKey });
  cacheActiveQueries.set(safeKey, { key: safeKey, ttlSeconds });
  return this;
}



export function cachingMiddleware<T extends Document>(schema: Schema<T, any>) {

    (schema.query as SchemaQuery).cache = cacheQuery;

    // 2️⃣ pre find middleware
    schema.pre<Query<any, any>>(/^find/, async function (next) {
        const cacheKey = this.getOptions()['cacheKey'];
        if (!cacheKey) return next();

        const cachedData = await CacheManager.get(cacheKey);

        if (cachedData) {
            console.log(`✅ Cache Hit for key: ${cacheKey}`);
            // Cache hit flag
            this.setOptions({ isCacheHit: true });

            // exec override
            const originalExec = this.exec;
            this.exec = async function () {
                return cachedData;
            };
        }

        next();
    });

    // 3️⃣ post find middleware
    schema.post<Query<any, any>>(/^find/, async function (docs, next) {
        const options = this.getOptions();
        const cacheKey = options['cacheKey'];

        if (!cacheKey || options['isCacheHit']) return next();

        const cacheConfig = cacheActiveQueries.get(cacheKey);
        if (cacheConfig) {
            console.log(`⬆️ Caching data for key: ${cacheConfig.key}`);
            await CacheManager.set(cacheConfig.key, docs, cacheConfig.ttlSeconds);
            cacheActiveQueries.delete(cacheConfig.key);
        }

        next();
    });
}
