import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Use this wrapper for any user-generated or external HTML content.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Validates and secures external links.
 * Rejects javascript: URLs and adds security attributes.
 */
export function safeExternalLink(href: string): { href: string; rel: string; target?: string } | null {
  const normalized = href.trim().toLowerCase();

  // Reject dangerous protocols
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('vbscript:')
  ) {
    return null;
  }

  // External links (http/https) get security attributes
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return {
      href,
      rel: 'noopener noreferrer',
      target: '_blank',
    };
  }

  // Internal links are safe
  return { href, rel: '' };
}
