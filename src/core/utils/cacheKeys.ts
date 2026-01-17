import client from '@shared/config/redis.config.ts';
import { createHash } from 'crypto';


// Version key helper
const versionKey = (entity: string) => `cache:ver:${entity}`;

export async function getVersion(entity: string): Promise<number> {
  const key = versionKey(entity);
  try {
    if (!client.isOpen) return 1;
    const v = await client.get(key);
    if (!v) {
      await client.set(key, '1');
      return 1;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 1;
  } catch (e) {
    // console.warn(`Redis Error (getVersion:${entity}):`, e);
    // Fallback gracefully without crashing
    return 1;
  }
}

export async function bumpVersion(entity: string): Promise<number> {
  try {
    if (!client.isOpen) return 1;
    return await client.incr(versionKey(entity));
  } catch (e) {
    return 1;
  }
}

export function hashPayload(payload: unknown): string {
  try {
    return createHash('sha1')
      .update(JSON.stringify(payload ?? {}))
      .digest('hex');
  } catch {
    return createHash('sha1').update(String(payload)).digest('hex');
  }
}

export async function buildItemKey(entity: string, id: string): Promise<string> {
  const v = await getVersion(entity);
  return `${entity}:v${v}:id:${id}`;
}

export async function buildListKey(entity: string, payload: unknown): Promise<string> {
  const v = await getVersion(entity);
  const h = hashPayload(payload);
  return `${entity}:v${v}:list:${h}`;
}

export async function buildCompositeVersion(entities: string[]): Promise<string> {
  const versions = await Promise.all(entities.map(getVersion));
  return entities.map((e, i) => `${e}-v${versions[i]}`).join('_');
}

export async function buildUserPermissionsKey(
  userId: string,
  scope?: { businessUnitId?: string | undefined; outletId?: string | undefined; organizationId?: string | undefined; companyId?: string | undefined }
): Promise<string> {
  const composite = await buildCompositeVersion(['role', 'permission', 'permission-group']);
  let scopeKey = 'global';

  if (scope?.outletId) {
    scopeKey = `outlet:${scope.outletId}`;
  } else if (scope?.businessUnitId) {
    scopeKey = `bu:${scope.businessUnitId}`;
  } else if (scope?.organizationId || scope?.companyId) {
    scopeKey = `org:${scope.organizationId || scope.companyId}`;
  }

  // Force invalidation by appending a suffix
  return `permissions:${composite}:v3:user:${userId}:scope:${scopeKey}`;
}
