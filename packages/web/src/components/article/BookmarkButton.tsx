/**
 * BookmarkButton - Toggle bookmark for an article
 */
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useIsBookmarked, useAddBookmark, useRemoveBookmark } from '../../hooks/useSupabase'
import '../../styles/components/bookmark-button.css'

interface BookmarkButtonProps {
  articleId: string
  articleTitle?: string
}

export function BookmarkButton({ articleId }: BookmarkButtonProps) {
  const { user } = useAuth()
  const [showLoginMessage, setShowLoginMessage] = useState(false)

  // Check if article is bookmarked
  const { data: isBookmarked = false, isLoading: checkingBookmark } = useIsBookmarked(articleId)

  // Mutations for add/remove bookmark
  const addBookmark = useAddBookmark()
  const removeBookmark = useRemoveBookmark()

  const handleClick = async () => {
    if (!user) {
      // Show login message
      setShowLoginMessage(true)
      setTimeout(() => setShowLoginMessage(false), 3000)
      return
    }

    try {
      if (isBookmarked) {
        await removeBookmark.mutateAsync(articleId)
      } else {
        await addBookmark.mutateAsync(articleId)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  const loading = checkingBookmark || addBookmark.isPending || removeBookmark.isPending

  return (
    <div className="bookmark-button-wrapper">
      <button
        className={`bookmark-button ${isBookmarked ? 'bookmark-button--active' : ''}`}
        onClick={handleClick}
        disabled={loading}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        title={isBookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
      >
        <svg
          viewBox="0 0 24 24"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          className="bookmark-button__icon"
        >
          <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className="bookmark-button__text">
          {loading ? 'Loading...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      </button>

      {showLoginMessage && (
        <div className="bookmark-button__tooltip">
          Sign in to save bookmarks
        </div>
      )}
    </div>
  )
}
