import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_ID,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

export type NewsItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title: string;
  category: string;
  content: string;
};

export type NewsListResponse = {
  contents: NewsItem[];
  totalCount: number;
  offset: number;
  limit: number;
};

/** ISO日付 → "YYYY.MM.DD" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}
