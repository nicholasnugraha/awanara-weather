export type CacheKey = string;
export type CacheValue<T> = { data: T; expires: number };

interface CacheBackend {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttlMs: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  [key: string]: any;
}

class InMemoryCache implements CacheBackend {
  private store = new Map<CacheKey, CacheValue<unknown>>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || entry.expires <= now) {
      await this.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.delete(key);
    this.store.set(key, {
      data: value,
      expires: Date.now() + ttlMs,
    });
    const timeout = setTimeout(async () => {
      await this.delete(key);
    }, ttlMs);
    this.timeouts.set(key, timeout);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    const t = this.timeouts.get(key);
    if (t) {
      clearTimeout(t);
      this.timeouts.delete(key);
    }
  }

  async clear(): Promise<void> {
    for (const key of this.store.keys()) {
      await this.delete(key);
    }
  }
}

export class WeatherCache {
  private backend: CacheBackend;
  private defaultTTL: number;

  constructor(customBackend?: CacheBackend, customTTLMs?: number) {
    this.backend = customBackend ?? new InMemoryCache();
    this.defaultTTL = customTTLMs ?? 5 * 60 * 1000; // 5 minutes default
  }

  getPrefix(): string {
    return "weather:";
  }

  makeKey(prefix: string, ...args: string[]): string {
    return this.getPrefix() + [prefix, ...args].join(":");
  }

  async get<T>(key: string): Promise<T | null> {
    return this.backend.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.backend.set<T>(key, value, ttlMs ?? this.defaultTTL);
  }

  async invalidate(pattern: string): Promise<void> {
    const prefix = pattern.replace("weather:*", "");
    for (const key of Array.from(this.backend["store"] as any)) {
      if (typeof key === "string" && key.startsWith(prefix)) {
        await this.backend.delete(key);
      }
    }
  }

  async clearAll(): Promise<void> {
    await this.backend.clear();
  }
}

declare global {
  var _weatherCache: WeatherCache | undefined;
}

export const getCache = (forceFresh?: boolean): WeatherCache => {
  if (global._weatherCache && !forceFresh) {
    return global._weatherCache;
  }
  global._weatherCache = new WeatherCache();
  return global._weatherCache;
};
