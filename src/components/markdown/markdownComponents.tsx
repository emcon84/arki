'use client'

import type { Components } from 'react-markdown'
import { MermaidDiagram } from '@/components/blueprint/MermaidDiagram'

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 border-b border-black/[0.08] pb-3 text-2xl font-bold text-[#111111] dark:border-white/10 dark:text-[#ededed] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 text-xl font-bold text-[#111111] dark:text-[#ededed]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-base font-semibold text-[#111111] dark:text-[#ededed]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-7 text-[#444444] dark:text-[#aaaaaa]">
      {children}
    </p>
  ),
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className ?? '')
    const lang = match?.[1]

    if (lang === 'mermaid') {
      return <MermaidDiagram code={String(children).replace(/\n$/, '')} />
    }

    if (lang) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-[#fafafa] px-4 py-3 text-sm font-mono text-[#111111] dark:bg-[#111111] dark:text-[#ededed]">
          {children}
        </code>
      )
    }

    return (
      <code className="rounded-md bg-[#fafafa] px-1.5 py-0.5 text-[0.875em] font-mono text-[#111111] dark:bg-white/10 dark:text-[#ededed]">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/10">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/10">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#fafafa] dark:bg-[#111111]">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-black/[0.08] odd:bg-transparent even:bg-[#fafafa]/50 dark:border-white/10 dark:even:bg-[#111111]/50">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#666666] dark:text-[#888888]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-[#444444] dark:text-[#aaaaaa]">
      {children}
    </td>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-1.5 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-7 text-[#444444] marker:text-[#888888] dark:text-[#aaaaaa]">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#111111] dark:text-[#ededed]">
      {children}
    </strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-black/30 pl-4 text-[#666666] dark:border-white/30 dark:text-[#888888]">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#111111] underline underline-offset-2 hover:text-[#444444] dark:text-[#ededed] dark:hover:text-[#aaaaaa]"
    >
      {children}
    </a>
  ),
}
