/**
 * Client-side file validation helpers.
 * ALWAYS validate files before upload to prevent malicious uploads.
 */

export type AllowedMimeType = 
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf';

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: AllowedMimeType[];
  allowedExtensions?: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_IMAGE_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validate a file before upload.
 * Returns { valid: true } if valid, or { valid: false, error: "..." } if invalid.
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): ValidationResult {
  const {
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedTypes = DEFAULT_IMAGE_TYPES,
    allowedExtensions,
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type as AllowedMimeType)) {
    const typeList = allowedTypes.join(', ');
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${typeList}`,
    };
  }

  // Check file extension if specified
  if (allowedExtensions) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      const extList = allowedExtensions.join(', ');
      return {
        valid: false,
        error: `Invalid file extension. Allowed extensions: ${extList}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate an image file specifically.
 */
export function validateImageFile(
  file: File,
  maxSizeMB = 5
): ValidationResult {
  return validateFile(file, {
    maxSizeMB,
    allowedTypes: DEFAULT_IMAGE_TYPES,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  });
}

/**
 * Generate a safe filename with timestamp and random component.
 * Format: timestamp-random.ext
 */
export function generateSafeFilename(originalFilename: string, userId?: string): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (userId) {
    return `${userId}/${timestamp}-${random}.${ext}`;
  }
  
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Check if a file is an image based on MIME type.
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
