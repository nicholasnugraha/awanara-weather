import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory TTL cache sederhana untuk BFF.
 * 
 * Design choices:
 * - in-memory: cukup untuk MVP & personal use (1000 calls/day = ~42 req/jam)
 * - TTL per-key: 5-10 menit sesuai OWM update frequency
 * - cleanup interval: hapus entry expired agar memory tidak membesar
 * - hit counter: bisa di-expand ke observability nanti
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix timestamp ms
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
}

export class SimpleCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(ttlMinutes: number = 10) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.startCleanup();
  }

  startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now >= entry.expiresAt) {
          this.store.delete(key);
        }
      }
    }, 60_000); // cleanup setiap menit
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  set(key: string, value: T, ttlMsOverride?: number): void {
    const expiresAt = Date.now() + (ttlMsOverride ?? this.ttlMs);
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry) return null;
    if (now >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  has(key: string): boolean {
    return !!this.get(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  stats(): CacheStats {
    const expiredCount = [...this.store.values()].filter(
      (e) => Date.now() >= e.expiresAt
    ).length;
    return {
      hits: 0, // belum di-instrumentasi
      misses: 0,
      keys: Math.max(0, this.store.size - expiredCount),
    };
  }
}

// Singleton instance global
export const weatherCache = new SimpleCache<any>(10);
