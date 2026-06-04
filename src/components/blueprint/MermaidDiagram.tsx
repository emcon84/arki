'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { useTheme } from '@/theme/ThemeContext'

interface MermaidDiagramProps {
  code: string
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'rendered' | 'error'>(
    'loading'
  )
  const uid = useId().replace(/:/g, '')
  const diagramId = `mermaid-${uid}`
  const { theme } = useTheme()

  useEffect(() => {
    let cancelled = false

    async function render() {
      setStatus('loading')
      try {
        const mermaid = (await import('mermaid')).default

        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        })

        const { svg } = await mermaid.render(diagramId, code.trim())

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setStatus('rendered')
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [code, theme, diagramId])

  if (status === 'error') {
    return (
      <div className="my-4 rounded-xl border border-black/[0.08] bg-[#fafafa] dark:border-white/10 dark:bg-[#111111]">
        <div className="border-b border-black/[0.08] px-4 py-2 dark:border-white/10">
          <span className="text-xs font-medium text-[#888888]">
            Diagram (raw)
          </span>
        </div>
        <pre className="overflow-x-auto p-4 text-sm text-[#111111] dark:text-[#ededed]">
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-black/[0.08] bg-[#fafafa] p-4 dark:border-white/10 dark:bg-[#111111]">
      {status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-[#888888]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white" />
          Rendering diagram...
        </div>
      )}
      <div
        ref={containerRef}
        className={status === 'loading' ? 'hidden' : 'flex justify-center'}
      />
    </div>
  )
}
