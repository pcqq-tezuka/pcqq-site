import { createClient } from 'microcms-js-sdk';
import type { MicroCMSListContent, MicroCMSImage } from 'microcms-js-sdk';

// ─── APIクライアント ───────────────────────────────────────────
export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey:        import.meta.env.MICROCMS_API_KEY,
});

// ─── 型定義 ────────────────────────────────────────────────────
export type BlogPost = MicroCMSListContent & {
  title:      string;
  slug?:      string;
  body:       string;
  thumbnail?: MicroCMSImage;
  excerpt?:   string;
  category?:  { id: string; name: string; slug: string } | string;
};

export const CATEGORY_META: Record<string, { label: string }> = {
  scam: { label: 'サポート詐欺対策' },
  case: { label: '修理事例' },
  tips: { label: 'お役立ち情報' },
  news:        { label: 'お知らせ' },
  information: { label: 'お知らせ' },
};

export function getCategorySlug(category?: BlogPost['category']): string | undefined {
  if (!category) return undefined;
  return typeof category === 'string' ? category : category.slug;
}

export function getPostSlug(post: BlogPost): string {
  return post.slug ?? post.id;
}

// ─── ユーティリティ ────────────────────────────────────────────

/** 日付を「2025年4月15日」形式にフォーマット */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** HTMLタグを除去してサマリーテキストを生成 */
export function extractExcerpt(html: string, length = 120): string {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > length ? text.slice(0, length) + '…' : text;
}

/** thumbnailをOGP用画像URL（1200×630）に変換 */
export function getOgImageUrl(thumbnail?: MicroCMSImage): string {
  if (!thumbnail) return '/og-default.jpg';
  return `${thumbnail.url}?w=1200&h=630&fit=crop&auto=format`;
}

// ─── API関数 ───────────────────────────────────────────────────

/** 記事一覧を取得（新着順） */
export async function getBlogList(limit = 20, offset = 0) {
  return client.getList<BlogPost>({
    endpoint: 'blogs',
    queries:  { limit, offset, orders: '-publishedAt', depth: 1 },
  });
}

/** トップページ用: 最新N件を取得 */
export async function getLatestBlogs(limit = 3) {
  return client.getList<BlogPost>({
    endpoint: 'blogs',
    queries:  { limit, orders: '-publishedAt', depth: 1 },
  });
}

/** SSG用: 全記事を取得（最大100件） */
export async function getAllBlogs() {
  return client.getList<BlogPost>({
    endpoint: 'blogs',
    queries:  { limit: 100, orders: '-publishedAt', depth: 1 },
  });
}

/** カテゴリ別記事一覧を取得 */
export async function getBlogsByCategory(categoryId: string, limit = 20, offset = 0) {
  return client.getList<BlogPost>({
    endpoint: 'blogs',
    queries:  { limit, offset, orders: '-publishedAt', depth: 1, filters: `category[equals]${categoryId}` },
  });
}

/** 記事詳細を取得 */
export async function getBlogDetail(contentId: string) {
  return client.getListDetail<BlogPost>({
    endpoint:  'blogs',
    contentId,
  });
}
