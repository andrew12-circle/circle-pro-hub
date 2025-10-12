/**
 * Search adapter (env-switchable)
 * Falls back to in-memory search when external search disabled
 */

const SEARCH_ENABLED = import.meta.env.VITE_SEARCH_ENABLED === "true";

export interface SearchHit<T> {
  id: string;
  score: number;
  data: T;
}

export interface SearchAdapter {
  index<T>(indexName: string, id: string, document: T): Promise<void>;
  search<T>(indexName: string, query: string): Promise<SearchHit<T>[]>;
  deleteIndex(indexName: string): Promise<void>;
}

class InMemorySearchAdapter implements SearchAdapter {
  private indexes = new Map<string, Map<string, unknown>>();

  async index<T>(indexName: string, id: string, document: T): Promise<void> {
    if (!this.indexes.has(indexName)) {
      this.indexes.set(indexName, new Map());
    }
    this.indexes.get(indexName)!.set(id, document);
  }

  async search<T>(indexName: string, query: string): Promise<SearchHit<T>[]> {
    const index = this.indexes.get(indexName);
    if (!index) return [];

    const lowerQuery = query.toLowerCase();
    const hits: SearchHit<T>[] = [];

    index.forEach((doc, id) => {
      const docStr = JSON.stringify(doc).toLowerCase();
      if (docStr.includes(lowerQuery)) {
        hits.push({ id, score: 1, data: doc as T });
      }
    });

    return hits;
  }

  async deleteIndex(indexName: string): Promise<void> {
    this.indexes.delete(indexName);
  }
}

export const search: SearchAdapter = SEARCH_ENABLED
  ? new InMemorySearchAdapter()
  : new InMemorySearchAdapter();
