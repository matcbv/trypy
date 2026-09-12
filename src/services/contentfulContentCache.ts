import { openDB, type IDBPDatabase } from 'idb';

const IDB_VERSION = 1;
const INDEXED_DB_NAME = 'trypy-content-cache';
const STORE_NAME = 'contentful';

interface CacheEntry<T> {
	data: T;
	fetchedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getIndexedDb() {
	if (!dbPromise) {
		dbPromise = openDB(INDEXED_DB_NAME, IDB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
			},
		});
	}

	return dbPromise;
}

export async function getCached<T>(key: string, ttl: number) {
	const indexedDb = await getIndexedDb();
	const entry = (await indexedDb.get(STORE_NAME, key)) as CacheEntry<T>;
	if (!entry) return null;

	const isExpired = Date.now() - entry.fetchedAt > ttl;
	return isExpired ? null : entry.data;
}

export async function setCached<T>(key: string, data: T) {
	const indexedDb = await getIndexedDb();
	const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
	await indexedDb.put(STORE_NAME, entry, key);
}

export async function clearCached(key: string) {
	const indexedDb = await getIndexedDb();
	await indexedDb.delete(STORE_NAME, key);
}
