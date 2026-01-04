import type { CommitteeMember } from '../types/content';
import committeeData from '../data/committee.json';

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

export interface CommitteeItem {
  name: string;
  title: string;
  photo: string;
}

/**
 * Hook to get committee data from the CMS
 */
export function useCommittee(): CommitteeItem[] {
  const cmsData = committeeData as CommitteeMember[];

  if (!cmsData || cmsData.length === 0) {
    return [];
  }

  return cmsData.map(item => ({
    name: item.name || '',
    title: item.title || '',
    photo: resolveImageUrl(item.photourl),
  }));
}
