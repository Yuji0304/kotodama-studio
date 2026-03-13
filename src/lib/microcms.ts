import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_ID,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

/** microCMS のカテゴリはテキスト型の場合は string、関連コンテンツ型の場合はオブジェクト */
export type MicroCMSCategory = string | { id: string; name: string };

export function getCategoryName(category: MicroCMSCategory | undefined): string | undefined {
  if (!category) return undefined;
  if (typeof category === 'string') return category;
  return category.name;
}

export type NewsItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  title: string;
  category?: MicroCMSCategory;
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
