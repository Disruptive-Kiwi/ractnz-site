import type { GalleryImage } from '../types/content';
import galleryData from '../data/gallery.json';

// Import all CMS images (downloaded from Google Drive at build time)
const cmsImages = import.meta.glob('../assets/images/cms/*', { eager: true, import: 'default' }) as Record<string, string>;

/**
 * Resolve image URL from CMS data
 * - "cms/filename.jpg" -> Downloaded Google Drive image
 * - "https://..." -> External URL (fallback)
 */
function resolveImageUrl(url: string): string {
  if (!url) return '';

  // Handle CMS images (downloaded from Google Drive)
  if (url.startsWith('cms/')) {
    const filename = url.replace('cms/', '');
    const globPath = `../assets/images/cms/${filename}`;
    if (cmsImages[globPath]) {
      return cmsImages[globPath];
    }
    console.warn(`CMS image not found: ${url}`);
    return '';
  }

  // Handle external URLs (http/https) as fallback
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return url;
}

export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Hook to get gallery data from the CMS
 */
export function useGallery(): GalleryItem[] {
  const cmsData = galleryData as GalleryImage[];

  if (!cmsData || cmsData.length === 0) {
    return [];
  }

  return cmsData.map(item => ({
    id: item.id,
    src: resolveImageUrl(item.imageurl),
    alt: item.alt || '',
    caption: item.caption,
  }));
}
