import { describe, expect, test, beforeEach } from "vitest";
import { WeatherCache } from "./cache";

describe("WeatherCache", () => {
  let cache: WeatherCache;
  const testKey = "test:key";

  beforeEach(async () => {
    cache = new WeatherCache();
    await cache.clearAll();
  });

  test("set and get value", async () => {
    await cache.set(testKey, { foo: "bar" }, 60000);
    const result = await cache.get<{ foo: string }>(testKey);
    expect(result).toEqual({ foo: "bar" });
  });

  test("expiry works", async () => {
    await cache.set(testKey, { foo: "bar" }, 100); // 100ms TTL
    const immediate = await cache.get<{ foo: string }>(testKey);
    expect(immediate).toEqual({ foo: "bar" });

    await new Promise((r) => setTimeout(r, 200));
    const expired = await cache.get<{ foo: string }>(testKey);
    expect(expired).toBeNull();
  });

  test("invalidation removes matching keys", async () => {
    const key1 = cache.makeKey("current", "jakarta");
    const key2 = cache.makeKey("hourly", "jakarta");
    const key3 = cache.makeKey("other", "something");

    await cache.set(key1, { data: 1 }, 10000);
    await cache.set(key2, { data: [2] }, 10000);
    await cache.set(key3, { data: 3 }, 10000);

    await cache.invalidate("weather:current:*");
    
    const remaining1 = await cache.get(key1);
    const remaining2 = await cache.get(key2);
    const remaining3 = await cache.get(key3);

    expect(remaining1).toBeNull();
    expect(remaining2).not.toBeNull();
    expect(remaining3).not.toBeNull();
  });
});
