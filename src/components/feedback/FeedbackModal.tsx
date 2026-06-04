'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslations } from '@/i18n/useTranslations'
import { API_ROUTES } from '@/constants'

interface FeedbackModalProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ sessionId, isOpen, onClose }: FeedbackModalProps) {
  const { t } = useTranslations()

  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThanks, setShowThanks] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (rating === null) return
    setIsSubmitting(true)

    try {
      await fetch(API_ROUTES.submitFeedback(sessionId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rating,
          ...(wouldRecommend !== null ? { wouldRecommend } : {}),
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        }),
      })
    } catch {
      // Best-effort submission - close modal regardless
    } finally {
      setIsSubmitting(false)
      setShowThanks(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }

  const activeRating = hoveredRating ?? rating

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-[#111111]">
        {showThanks ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-lg font-semibold text-[#111111] dark:text-[#ededed]">
              {t.feedback.thanks}
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-lg font-semibold text-[#111111] dark:text-[#ededed]">
              {t.feedback.title}
            </h2>

            {/* Rating stars */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888888]">
                {t.feedback.ratingLabel}
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        activeRating !== null && star <= activeRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-[#cccccc] dark:text-[#444444]'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Would recommend */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888888]">
                {t.feedback.recommendLabel}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setWouldRecommend(wouldRecommend === true ? null : true)
                  }
                  className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${
                    wouldRecommend === true
                      ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-black/[0.08] bg-transparent text-[#111111] hover:bg-[#f5f5f5] dark:border-white/10 dark:text-[#ededed] dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  {t.feedback.yes}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWouldRecommend(wouldRecommend === false ? null : false)
                  }
                  className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${
                    wouldRecommend === false
                      ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-black/[0.08] bg-transparent text-[#111111] hover:bg-[#f5f5f5] dark:border-white/10 dark:text-[#ededed] dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  {t.feedback.no}
                </button>
              </div>
            </div>

            {/* Comment */}
            <div className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.feedback.commentPlaceholder}
                rows={3}
                className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#888888] focus:border-black/30 focus:outline-none focus:ring-1 focus:ring-black/20 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#ededed] dark:placeholder-[#666666] dark:focus:border-white/30 dark:focus:ring-white/10"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-[#888888] hover:text-[#555555] dark:hover:text-[#aaaaaa]"
              >
                {t.feedback.skip}
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={rating === null || isSubmitting}
                className="rounded-xl bg-[#111111] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-[#ededed]"
              >
                {isSubmitting ? '...' : t.feedback.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
