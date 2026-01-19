/**
 * BookmarksPage - Display user's bookmarked articles
 */
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBookmarks, useRemoveBookmark } from '../hooks/useSupabase'
import '../styles/pages/bookmarks-page.css'

export function BookmarksPage() {
  const { user } = useAuth()
  const { data: bookmarks = [], isLoading, error } = useBookmarks(user?.id)
  const removeBookmark = useRemoveBookmark()

  const handleRemoveBookmark = async (articleId: string) => {
    try {
      await removeBookmark.mutateAsync(articleId)
    } catch (err) {
      console.error('Failed to remove bookmark:', err)
    }
  }

  if (!user) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-page__empty">
          <h1>Bookmarks</h1>
          <p>Sign in to view your bookmarked articles.</p>
          <Link to="/" className="bookmarks-page__cta">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-page__header">
          <h1>My Bookmarks</h1>
        </div>
        <div className="bookmarks-page__loading">
          <p>Loading your bookmarks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-page__header">
          <h1>My Bookmarks</h1>
        </div>
        <div className="bookmarks-page__error">
          <p>Failed to load bookmarks. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-page__header">
          <h1>My Bookmarks</h1>
        </div>
        <div className="bookmarks-page__empty">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="bookmarks-page__empty-icon"
          >
            <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2>No bookmarks yet</h2>
          <p>Start bookmarking articles to save them for later.</p>
          <Link to="/" className="bookmarks-page__cta">
            Browse Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-page__header">
        <h1>My Bookmarks</h1>
        <p className="bookmarks-page__count">
          {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'} saved
        </p>
      </div>

      <div className="bookmarks-page__list">
        {bookmarks.map((bookmark) => {
          const article = bookmark.article
          const articleUrl = `/${article.game}/${article.version}/${article.section}/${article.category}/${article.slug}`

          return (
            <div key={bookmark.id} className="bookmark-card">
              <div className="bookmark-card__content">
                <Link to={articleUrl} className="bookmark-card__title">
                  {article.title}
                </Link>

                {article.excerpt && (
                  <p className="bookmark-card__excerpt">{article.excerpt}</p>
                )}

                <div className="bookmark-card__meta">
                  <span className="bookmark-card__category">
                    {article.category}
                  </span>
                  {article.difficulty && (
                    <span className={`bookmark-card__difficulty bookmark-card__difficulty--${article.difficulty}`}>
                      {article.difficulty}
                    </span>
                  )}
                  <span className="bookmark-card__date">
                    Saved {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                className="bookmark-card__remove"
                onClick={() => handleRemoveBookmark(article.id)}
                disabled={removeBookmark.isPending}
                aria-label="Remove bookmark"
                title="Remove bookmark"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="bookmark-card__remove-icon"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
