import type { PortalType } from "@/db/schema/portal-roles";

/**
 * Portal access cache entry
 */
interface PortalAccessCacheEntry {
  portalAccess: Array<{ portalType: PortalType; role: string }>;
  expiresAt: number;
}

/**
 * In-memory cache for portal access queries
 * Cache key format: `portal-access:${userId}:${organizationId}`
 * TTL: 5 minutes
 */
class PortalAccessCache {
  private cache: Map<string, PortalAccessCacheEntry> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from user and organization IDs
   */
  private getCacheKey(userId: string, organizationId: string): string {
    return `portal-access:${userId}:${organizationId}`;
  }

  /**
   * Get portal access from cache if valid
   */
  get(
    userId: string,
    organizationId: string
  ): Array<{ portalType: PortalType; role: string }> | null {
    const key = this.getCacheKey(userId, organizationId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.portalAccess;
  }

  /**
   * Set portal access in cache
   */
  set(
    userId: string,
    organizationId: string,
    portalAccess: Array<{ portalType: PortalType; role: string }>
  ): void {
    const key = this.getCacheKey(userId, organizationId);
    const expiresAt = Date.now() + this.TTL_MS;

    this.cache.set(key, {
      portalAccess,
      expiresAt,
    });
  }

  /**
   * Invalidate cache for a specific user-organization pair
   */
  invalidate(userId: string, organizationId: string): void {
    const key = this.getCacheKey(userId, organizationId);
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries for a user (across all organizations)
   */
  invalidateUser(userId: string): void {
    const prefix = `portal-access:${userId}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics (for debugging)
   */
  getStats(): {
    size: number;
    entries: Array<{ key: string; expiresAt: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresAt: entry.expiresAt,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}

// Export singleton instance
export const portalAccessCache = new PortalAccessCache();

