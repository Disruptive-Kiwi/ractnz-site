/**
 * Content types for Google Sheets CMS data
 */

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface GalleryImage {
  id: number;
  imageurl: string;  // Column name from sheets (lowercase)
  alt: string;
  caption?: string;
}

export interface CommitteeMember {
  id: number;
  name: string;
  title: string;
  photourl: string;  // Column name from sheets (lowercase)
}
