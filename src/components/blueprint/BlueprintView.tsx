'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Blueprint, Spec } from '@/types'
import { ExportButton } from './ExportButton'
import { FileCode, Code2 } from 'lucide-react'
import { useTranslations } from '@/i18n/useTranslations'
import { markdownComponents } from '@/components/markdown/markdownComponents'
import { useSpecs } from '@/hooks/useSpecs'
import { SpecsView } from '@/components/specs/SpecsView'
import { FeedbackModal } from '@/components/feedback/FeedbackModal'

interface BlueprintViewProps {
  blueprint: Blueprint
  sessionId: string
  initialSpec?: Spec | null
  isNewlyGenerated?: boolean
}

export function BlueprintView({ blueprint, sessionId, initialSpec, isNewlyGenerated = false }: BlueprintViewProps) {
  const { t } = useTranslations()
  const { spec, isGenerating, generate, error: specsError } = useSpecs({ sessionId })
  const resolvedSpec = spec ?? initialSpec ?? null

  const [specsGeneratingStep, setSpecsGeneratingStep] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const feedbackScheduled = useRef(false)

  useEffect(() => {
    if (!isNewlyGenerated) return
    if (feedbackScheduled.current) return
    feedbackScheduled.current = true
    const timer = setTimeout(() => {
      setShowFeedback(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [isNewlyGenerated])

  useEffect(() => {
    if (!isGenerating) {
      setSpecsGeneratingStep(0)
      return
    }
    const steps = t.specs.generatingSteps
    const interval = setInterval(() => {
      setSpecsGeneratingStep((prev) => (prev + 1) % steps.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [isGenerating, t.specs.generatingSteps])

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-[#111111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.08] bg-[#fafafa] px-6 py-4 dark:border-white/10 dark:bg-black">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] dark:bg-white">
              <FileCode className="h-4 w-4 text-white dark:text-black" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111111] dark:text-[#ededed]">
                {t.blueprint.title}
              </h2>
              <p className="text-xs text-[#888888]">
                {t.blueprint.generatedBy} -{' '}
                {new Date(blueprint.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!resolvedSpec && !isGenerating && (
              <button
                onClick={() => void generate()}
                className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f0f0f0] dark:border-white/10 dark:bg-[#111111] dark:text-[#ededed] dark:hover:bg-[#1a1a1a]"
              >
                <Code2 className="h-4 w-4" strokeWidth={2} />
                {t.specs.generate}
              </button>
            )}
            <ExportButton content={blueprint.content} />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {blueprint.content}
          </ReactMarkdown>
        </div>
      </div>

      {specsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {specsError}
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white" />
          <span
            key={specsGeneratingStep}
            className="animate-pulse text-sm text-[#888888]"
            style={{ animationDuration: '1s' }}
          >
            {t.specs.generatingSteps[specsGeneratingStep]}
          </span>
        </div>
      )}

      {resolvedSpec && <SpecsView spec={resolvedSpec} />}

      <FeedbackModal
        sessionId={sessionId}
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  )
}
