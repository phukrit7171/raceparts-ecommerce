interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

type CacheItem<T = unknown> = {
  data: T;
  expiresAt?: number;
};

type CacheWithTTL<T = unknown> = {
  data: T;
  timestamp: number;
};

// Define a common interface for our cache implementation
interface ICache {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getWithTTL<T = unknown>(key: string, ttl: number): Promise<T | null>;
  setWithTTL<T = unknown>(key: string, value: T, ttl: number): Promise<void>;
}

class MemoryCache implements ICache {
  private store: Map<string, CacheItem<unknown>>;

  constructor() {
    this.store = new Map();
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      await this.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  async set<T = unknown>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const item: CacheItem<T> = {
      data: value,
    };
    
    if (options.ttl) {
      item.expiresAt = Date.now() + options.ttl;
    }
    
    this.store.set(key, item as CacheItem<unknown>);
  }
  
  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
  
  async clear(): Promise<void> {
    this.store.clear();
  }
  
  async getWithTTL<T = unknown>(key: string, ttl: number): Promise<T | null> {
    const item = await this.get<{ data: T; timestamp: number }>(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > ttl) {
      await this.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  async setWithTTL<T = unknown>(key: string, value: T, ttl: number): Promise<void> {
    const item = {
      data: value,
      timestamp: Date.now(),
    };
    
    await this.set(key, item, { ttl });
  }
}

const isBrowser = typeof window !== 'undefined';
const hasCacheAPI = isBrowser && 'caches' in window && typeof window.caches.open === 'function';

class CacheStore implements ICache {
  private cache: ICache;
  private cacheName: string;

  private cacheInstance: Cache | null = null;

  constructor(cacheName = 'raceparts-cache') {
    this.cacheName = cacheName;
    this.cache = new MemoryCache();
    
    if (hasCacheAPI) {
      this.initCache();
    }
  }

  private async initCache() {
    try {
      this.cacheInstance = await window.caches.open(this.cacheName);
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      if (this.cacheInstance) {
        const response = await this.cacheInstance.match(key);
        if (!response) return null;
        return await response.json();
      }
      return await this.cache.get<T>(key);
    } catch (error) {
      console.error('Cache get failed:', error);
      return await this.cache.get<T>(key);
    }
  }

  async set<T = unknown>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      if (this.cacheInstance) {
        const response = new Response(JSON.stringify(value), {
          headers: { 'Content-Type': 'application/json' },
        });
        await this.cacheInstance.put(key, response);
      } else {
        await this.cache.set(key, value, options);
      }
    } catch (error) {
      console.error('Cache set failed:', error);
      await this.cache.set(key, value, options);
    }
  }

  async getWithTTL<T = unknown>(key: string, ttl: number): Promise<T | null> {
    const item = await this.get(key);
    if (!item) return null;
    
    const { data, timestamp } = item as CacheWithTTL<T>;
    if (Date.now() - timestamp > ttl) {
      await this.delete(key);
      return null;
    }
    
    return data as T;
  }

  async setWithTTL<T = unknown>(key: string, value: T, ttl: number): Promise<void> {
    const item: CacheWithTTL<T> = {
      data: value,
      timestamp: Date.now(),
    };
    await this.set(key, item, { ttl });
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (this.cacheInstance) {
        return await this.cacheInstance.delete(key);
      }
      return await this.cache.delete(key);
    } catch (error) {
      console.error('Cache delete failed:', error);
      return await this.cache.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.cacheInstance) {
        const cacheNames = await this.cacheInstance.keys();
        await Promise.all(cacheNames.map(name => this.cacheInstance?.delete(name)));
      } else {
        await this.cache.clear();
      }
    } catch (error) {
      console.error('Cache clear failed:', error);
      await this.cache.clear();
    }
  }
}

export const cache = new CacheStore();
export default cache;
