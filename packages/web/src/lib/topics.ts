/**
 * The wiki's big topics and section groups (owner, 2026-11-21: "make that simpler, larger
 * topics at the top"). Display only: every section, category and article keeps its URL.
 *
 * - A build's front page shows its topics (versions.config.json "topics"), each holding one
 *   or more sections, instead of one card per section.
 * - A section's page lists its categories under the section's groups (_section.json
 *   "groups", _category.json "group") instead of one long grid.
 *
 * Both fall back to the plain lists when the generated navigation has no topics or groups.
 */
import type { CategoryInfo, SectionInfo, VersionInfo } from '../config/versions.generated'

export interface TopicView {
  id: string
  name: string
  description: string
  icon: string
  /** The topic's sections that have articles, in the topic's order. */
  sections: SectionInfo[]
  articleCount: number
}

export interface CategoryGroupView {
  id: string
  name: string
  description: string
  categories: CategoryInfo[]
}

/** The id of the heading that collects categories with no group. */
export const MORE_GROUP_ID = 'more'

export function sectionArticleCount(section: SectionInfo): number {
  return section.categories.reduce((sum, category) => sum + category.articleCount, 0)
}

/**
 * A build's topics with their sections resolved, skipping sections with no articles and
 * topics left empty. Null when the build has no topics, so the page shows its plain list.
 */
export function topicsFor(version: VersionInfo): TopicView[] | null {
  if (!version.topics || version.topics.length === 0) return null
  const byId = new Map(version.sections.map((section) => [section.id, section]))
  const topics: TopicView[] = []
  for (const topic of version.topics) {
    const sections = topic.sections
      .map((id) => byId.get(id))
      .filter((section): section is SectionInfo => section !== undefined && sectionArticleCount(section) > 0)
    if (sections.length === 0) continue
    topics.push({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      icon: topic.icon,
      sections,
      articleCount: sections.reduce((sum, section) => sum + sectionArticleCount(section), 0),
    })
  }
  return topics
}

/**
 * The given categories (already filtered and ordered by the page) under the section's
 * groups, in the groups' order; empty groups are left out and categories with no group go
 * under a last "More" heading. Null when the section has no groups.
 */
export function groupCategories(section: SectionInfo, categories: readonly CategoryInfo[]): CategoryGroupView[] | null {
  if (!section.groups || section.groups.length === 0) return null
  const known = new Set(section.groups.map((group) => group.id))
  const views: CategoryGroupView[] = section.groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    categories: categories.filter((category) => category.group === group.id),
  }))
  const ungrouped = categories.filter((category) => !category.group || !known.has(category.group))
  if (ungrouped.length > 0) {
    views.push({ id: MORE_GROUP_ID, name: 'More', description: '', categories: ungrouped })
  }
  return views.filter((view) => view.categories.length > 0)
}
