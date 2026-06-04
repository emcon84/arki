'use client'

import { useState } from 'react'
import { Copy, Check, Download, Code } from 'lucide-react'
import { useTranslations } from '@/i18n/useTranslations'
import { generateHtmlExport } from '@/lib/generateHtmlExport'

interface ExportButtonProps {
  content: string
  filename?: string
}

export function ExportButton({
  content,
  filename = 'architecture-blueprint.md',
}: ExportButtonProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslations()

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadHtml = () => {
    const html = generateHtmlExport(content)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.replace(/\.md$/, '.html')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => void handleCopy()}
        className="flex items-center gap-2 rounded-lg border border-black/[0.08] px-3 py-1.5 text-xs font-medium text-[#444444] transition-colors hover:bg-[#fafafa] dark:border-white/10 dark:text-[#aaaaaa] dark:hover:bg-white/5"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" strokeWidth={2} />
            <span className="text-green-500">{t.blueprint.copied}</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            {t.blueprint.copy}
          </>
        )}
      </button>
      <button
        onClick={handleDownloadHtml}
        className="flex items-center gap-2 rounded-lg border border-black/[0.08] px-3 py-1.5 text-xs font-medium text-[#444444] transition-colors hover:bg-[#fafafa] dark:border-white/10 dark:text-[#aaaaaa] dark:hover:bg-white/5"
      >
        <Code className="h-3.5 w-3.5" strokeWidth={2} />
        {t.blueprint.downloadHtml}
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-lg bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-[#ededed]"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
        {t.blueprint.download}
      </button>
    </div>
  )
}
