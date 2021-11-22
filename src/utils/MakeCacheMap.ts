import LruCache, { Options } from "lru-cache";

class Cache extends LruCache<unknown, unknown> {
  delete(key: unknown) {
    return this.del(key);
  }

  clear() {
    return this.reset();
  }
}

const MakeCacheMap = (options: Options<unknown, unknown>) => {
  return new Cache(options);
};

export default MakeCacheMap;
