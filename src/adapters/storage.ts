/**
 * Storage adapter with presigned upload support.
 * Uses BFF for presigned URLs (secure) or falls back to direct Supabase upload.
 */

import { supabase } from "@/integrations/supabase/client";
import { validateFile, generateSafeFilename, type AllowedMimeType } from "@/lib/fileValidation";

export interface StorageObject {
  key: string;
  url: string;
  cdnUrl?: string;
}

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  bucket: string;
}

export interface StorageAdapter {
  upload(file: File, path: string, bucket?: string): Promise<StorageObject>;
  delete(key: string, bucket?: string): Promise<void>;
  getPublicUrl(key: string, bucket?: string): string;
}

/**
 * Production adapter: uses BFF presigned URLs (secure, no file proxy).
 */
class PresignedStorageAdapter implements StorageAdapter {
  private apiBase: string;

  constructor(apiBase: string) {
    this.apiBase = apiBase;
  }

  async upload(file: File, path: string, bucket = 'avatars'): Promise<StorageObject> {
    // Client-side validation (always validate!)
    const validation = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as AllowedMimeType[],
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get presigned upload URL from BFF
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const presignReq = await fetch(`${this.apiBase}/api/uploads/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        key: path,
        contentType: file.type,
        bucket,
      }),
    });

    if (!presignReq.ok) {
      const errText = await presignReq.text();
      throw new Error(`Presign failed: ${errText}`);
    }

    const presign: PresignResponse = await presignReq.json();

    // Upload directly to storage (no app proxy!)
    const uploadReq = await fetch(presign.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadReq.ok) {
      throw new Error('Upload failed');
    }

    // Get public URL
    const publicUrl = this.getPublicUrl(presign.key, bucket);

    return {
      key: presign.key,
      url: publicUrl,
      cdnUrl: import.meta.env.VITE_STORAGE_CDN_URL
        ? `${import.meta.env.VITE_STORAGE_CDN_URL}/${bucket}/${presign.key}`
        : undefined,
    };
  }

  async delete(key: string, bucket = 'avatars'): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([key]);
    if (error) throw error;
  }

  getPublicUrl(key: string, bucket = 'avatars'): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    return data.publicUrl;
  }
}

/**
 * Fallback adapter: direct Supabase upload (local dev, no BFF).
 */
class DirectStorageAdapter implements StorageAdapter {
  async upload(file: File, path: string, bucket = 'avatars'): Promise<StorageObject> {
    // Client-side validation
    const validation = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as AllowedMimeType[],
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      key: path,
      url: data.publicUrl,
    };
  }

  async delete(key: string, bucket = 'avatars'): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([key]);
    if (error) throw error;
  }

  getPublicUrl(key: string, bucket = 'avatars'): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    return data.publicUrl;
  }
}

// Use presigned adapter if BFF is configured, otherwise fallback to direct
const apiBase = import.meta.env.VITE_API_BASE;
export const storage: StorageAdapter = apiBase
  ? new PresignedStorageAdapter(apiBase)
  : new DirectStorageAdapter();
