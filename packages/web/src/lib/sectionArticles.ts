/**
 * A category id is unique only inside its section: Build 42 has `getting-started` in
 * both `modding` and `server`, and `reference` in both `modding` and `vehicles`. The
 * articles query (getArticlesByCategory) filters by game, version and category only,
 * so the category and article pages keep just the rows of the section in the URL.
 */
export function inSection<T extends { section: string }>(articles: readonly T[], section: string): T[] {
  if (!section) return [...articles]
  return articles.filter((article) => article.section === section)
}
