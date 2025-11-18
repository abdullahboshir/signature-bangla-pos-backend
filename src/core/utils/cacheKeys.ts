import { createHash } from 'crypto';
import client from '../config/redis.config.js';

// Version key helper
const versionKey = (entity: string) => `cache:ver:${entity}`;

export async function getVersion(entity: string): Promise<number> {
  const key = versionKey(entity);
  const v = await client.get(key);
  if (!v) {
    await client.set(key, '1');
    return 1;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 1;
}

export async function bumpVersion(entity: string): Promise<number> {
  return client.incr(versionKey(entity));
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

export async function buildUserPermissionsKey(userId: string): Promise<string> {
  const composite = await buildCompositeVersion(['role', 'permission']);
  return `permissions:${composite}:user:${userId}`;
}
