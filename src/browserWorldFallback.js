// Browser world-storage fallback.
// If IndexedDB cannot open, WebMinecraftT transparently uses Cache Storage
// (with localStorage as a last-resort fallback) for the saved-world database.
// This keeps a broken IndexedDB installation from repeatedly logging errors.

const DB_NAME = "webminecraft-local-worlds";
const STORE_NAME = "worlds";
const CACHE_NAME = "webminecraft-world-fallback-v1";
const CACHE_URL = "/__webminecraft_world_storage__";
const LOCAL_KEY = "webminecraft_world_storage_fallback";
const GUARD_KEY = "__webMinecraftWorldFallbackInstalled";

if (!window[GUARD_KEY]) {
    window[GUARD_KEY] = true;

    const nativeIndexedDB = window.indexedDB;
    const nativeOpen = nativeIndexedDB?.open?.bind(nativeIndexedDB);
    let dataPromise = null;
    let writeQueue = Promise.resolve();

    function clone(value) {
        if (value === undefined) return value;
        try { return structuredClone(value); } catch { return JSON.parse(JSON.stringify(value)); }
    }

    async function loadData() {
        if (dataPromise) return dataPromise;
        dataPromise = (async () => {
            try {
                if (window.caches) {
                    const cache = await caches.open(CACHE_NAME);
                    const response = await cache.match(CACHE_URL);
                    if (response) {
                        const json = await response.json();
                        if (Array.isArray(json)) return new Map(json.map(item => [String(item.seed), item]));
                    }
                }
            } catch {}

            try {
                const json = localStorage.getItem(LOCAL_KEY);
                const values = JSON.parse(json || "[]");
                if (Array.isArray(values)) return new Map(values.map(item => [String(item.seed), item]));
            } catch {}

            return new Map();
        })();
        return dataPromise;
    }

    async function persistData(map) {
        const values = [...map.values()].map(clone);
        writeQueue = writeQueue.then(async () => {
            let saved = false;

            try {
                if (window.caches) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(
                        CACHE_URL,
                        new Response(JSON.stringify(values), {
                            headers: { "Content-Type": "application/json" }
                        })
                    );
                    saved = true;
                }
            } catch {}

            if (!saved) {
                try {
                    localStorage.setItem(LOCAL_KEY, JSON.stringify(values));
                    saved = true;
                } catch {}
            }

            // Keep the in-memory copy even if the browser has no writable storage.
            return saved;
        }).catch(() => false);

        return writeQueue;
    }

    function makeRequest(operation) {
        const request = {
            result: undefined,
            error: null,
            onsuccess: null,
            onerror: null
        };

        Promise.resolve().then(async () => {
            try {
                request.result = await operation();
                request.onsuccess?.({ target: request });
            } catch (error) {
                request.error = error;
                request.onerror?.({ target: request });
            }
        });

        return request;
    }

    function makeTransaction(map, mode) {
        let completeHandler = null;
        let errorHandler = null;
        let aborted = false;
        let pending = [];

        const tx = {
            mode,
            error: null,
            objectStore() {
                return {
                    getAll() {
                        return makeRequest(() => [...map.values()].map(clone));
                    },
                    get(seed) {
                        return makeRequest(() => clone(map.get(String(seed))));
                    },
                    put(value) {
                        const request = makeRequest(async () => {
                            map.set(String(value.seed), clone(value));
                            await persistData(map);
                            return value;
                        });
                        pending.push(request);
                        return request;
                    },
                    delete(seed) {
                        const request = makeRequest(async () => {
                            map.delete(String(seed));
                            await persistData(map);
                            return undefined;
                        });
                        pending.push(request);
                        return request;
                    }
                };
            },
            abort() {
                aborted = true;
                tx.error = new Error("Browser world storage transaction aborted.");
                errorHandler?.({ target: tx });
            }
        };

        Object.defineProperties(tx, {
            oncomplete: {
                get: () => completeHandler,
                set: value => {
                    completeHandler = value;
                    if (pending.length) {
                        Promise.all(pending).then(() => {
                            if (!aborted) completeHandler?.({ target: tx });
                        }).catch(error => {
                            tx.error = error;
                            errorHandler?.({ target: tx });
                        });
                    }
                }
            },
            onerror: {
                get: () => errorHandler,
                set: value => { errorHandler = value; }
            },
            onabort: {
                get: () => errorHandler,
                set: value => { errorHandler = value; }
            }
        });

        return tx;
    }

    function makeDatabase(map) {
        return {
            name: DB_NAME,
            version: 1,
            objectStoreNames: {
                contains(name) { return name === STORE_NAME; }
            },
            transaction(_storeName, mode) {
                return makeTransaction(map, mode);
            },
            close() {}
        };
    }

    function fallbackOpen() {
        let upgradeHandler = null;
        let successHandler = null;
        let errorHandler = null;
        const request = {
            result: null,
            error: null,
            source: null,
            transaction: null
        };

        Object.defineProperties(request, {
            onupgradeneeded: { get: () => upgradeHandler, set: value => { upgradeHandler = value; } },
            onsuccess: { get: () => successHandler, set: value => { successHandler = value; } },
            onerror: { get: () => errorHandler, set: value => { errorHandler = value; } }
        });

        loadData().then(map => {
            request.result = makeDatabase(map);
            // Run after callers have assigned event handlers.
            Promise.resolve().then(() => successHandler?.({ target: request }));
        }).catch(error => {
            request.error = error;
            Promise.resolve().then(() => errorHandler?.({ target: request }));
        });

        return request;
    }

    // Only replace the game's world database. Other IndexedDB users, including
    // Firebase Auth, continue using the browser's native IndexedDB implementation.
    window.indexedDB = {
        ...nativeIndexedDB,
        open(name, version) {
            if (name === DB_NAME) return fallbackOpen();
            return nativeOpen(name, version);
        }
    };
}
