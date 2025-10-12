/**
 * Storage adapter (env-switchable)
 * Uses Supabase Storage when configured
 */

export interface StorageObject {
  key: string;
  url: string;
  cdnUrl?: string;
}

export interface StorageAdapter {
  upload(file: File, path: string): Promise<StorageObject>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

class StubStorageAdapter implements StorageAdapter {
  async upload(): Promise<StorageObject> {
    throw new Error("Storage not configured");
  }
  async delete(): Promise<void> {
    throw new Error("Storage not configured");
  }
  async getSignedUrl(): Promise<string> {
    throw new Error("Storage not configured");
  }
}

export const storage: StorageAdapter = new StubStorageAdapter();
