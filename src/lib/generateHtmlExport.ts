const CSS = `
:root {
  --bg: #000;
  --surface: #111;
  --surface2: #1a1a1a;
  --border: rgba(255,255,255,0.1);
  --text: #ededed;
  --muted: #888;
  --accent: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
body { background: var(--bg); color: var(--text); max-width: 860px; margin: 0 auto; padding: 48px 32px; line-height: 1.7; }
h1 { font-size: 2.25rem; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 8px; }
h2 { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.02em; margin: 48px 0 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
h3 { font-size: 1.05rem; font-weight: 600; margin: 32px 0 10px; color: var(--accent); }
p { margin: 0 0 16px; color: var(--text); }
strong { color: var(--accent); font-weight: 600; }
code { font-family: 'SF Mono', Consolas, monospace; background: var(--surface); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
pre { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px; overflow-x: auto; margin: 16px 0; }
pre code { background: none; padding: 0; font-size: 0.875rem; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9rem; }
th { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--muted); font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 10px 14px; border-bottom: 1px solid var(--border); }
tr:last-child td { border-bottom: none; }
ul, ol { margin: 0 0 16px; padding-left: 24px; }
li { margin-bottom: 6px; }
hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }
.header { margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
.header-meta { font-size: 0.8rem; color: var(--muted); margin-top: 8px; letter-spacing: 0.02em; text-transform: uppercase; }
.mermaid { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px; margin: 16px 0; text-align: center; }
.adr-block { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px 28px; margin: 24px 0; }
.adr-block h3 { margin-top: 0; }
blockquote { border-left: 2px solid var(--border); margin: 16px 0; padding: 4px 20px; color: var(--muted); }
@media print { body { max-width: 100%; padding: 24px; } }
`

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
}

function extractProjectName(content: string): string {
  const match = /^#\s+(.+)$/m.exec(content)
  if (!match) return 'Architecture Blueprint'
  // Remove leading "Architecture Blueprint - " or similar prefixes if present
  return match[1].trim()
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyInlineFormatting(text: string): string {
  // Bold must come before italic to avoid partial matches
  let result = text
  // **bold**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // *italic* (single asterisk, not double)
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  // `inline code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
  return result
}

interface ParseState {
  inCodeBlock: boolean
  codeBlockLang: string
  codeBlockLines: string[]
  inTable: boolean
  tableLines: string[]
  inList: boolean
  listLines: string[]
  inAdrBlock: boolean
  adrLines: string[]
  outputLines: string[]
}

function flushList(state: ParseState): void {
  if (!state.inList) return
  state.outputLines.push('<ul>')
  for (const line of state.listLines) {
    const content = line.replace(/^-\s+/, '')
    state.outputLines.push(`  <li>${applyInlineFormatting(content)}</li>`)
  }
  state.outputLines.push('</ul>')
  state.listLines = []
  state.inList = false
}

function flushTable(state: ParseState): void {
  if (!state.inTable) return
  const rows = state.tableLines
  state.outputLines.push('<table>')

  // First row is the header, second is the separator, rest are data rows
  if (rows.length === 0) {
    state.outputLines.push('</table>')
    state.tableLines = []
    state.inTable = false
    return
  }

  const parseRow = (row: string): string[] =>
    row
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())

  const headerCells = parseRow(rows[0])
  state.outputLines.push('<thead><tr>')
  for (const cell of headerCells) {
    state.outputLines.push(`  <th>${applyInlineFormatting(cell)}</th>`)
  }
  state.outputLines.push('</tr></thead>')

  // rows[1] is the separator line (---|---), skip it
  const dataRows = rows.slice(2)
  if (dataRows.length > 0) {
    state.outputLines.push('<tbody>')
    for (const row of dataRows) {
      const cells = parseRow(row)
      state.outputLines.push('<tr>')
      for (const cell of cells) {
        state.outputLines.push(`  <td>${applyInlineFormatting(cell)}</td>`)
      }
      state.outputLines.push('</tr>')
    }
    state.outputLines.push('</tbody>')
  }

  state.outputLines.push('</table>')
  state.tableLines = []
  state.inTable = false
}

function flushAdrBlock(state: ParseState): void {
  if (!state.inAdrBlock) return
  // Close the adr-block div - content is already pushed inside it
  state.outputLines.push('</div>')
  state.inAdrBlock = false
  state.adrLines = []
}

function isTableLine(line: string): boolean {
  return line.trimStart().startsWith('|') && line.trimEnd().endsWith('|')
}

function isSeparatorLine(line: string): boolean {
  return /^\|[\s|:-]+\|$/.test(line.trim())
}

function convertMarkdownToHtml(content: string): string {
  const lines = content.split('\n')
  const state: ParseState = {
    inCodeBlock: false,
    codeBlockLang: '',
    codeBlockLines: [],
    inTable: false,
    tableLines: [],
    inList: false,
    listLines: [],
    inAdrBlock: false,
    adrLines: [],
    outputLines: [],
  }

  // We track whether the first H1 has been emitted (we skip it, it goes in the header)
  let firstH1Skipped = false

  for (const line of lines) {
    // --- Code block handling ---
    if (state.inCodeBlock) {
      if (line.trim() === '```') {
        const codeContent = state.codeBlockLines.join('\n')
        if (state.codeBlockLang === 'mermaid') {
          state.outputLines.push(`<div class="mermaid">${codeContent}</div>`)
        } else {
          state.outputLines.push(`<pre><code>${escapeHtml(codeContent)}</code></pre>`)
        }
        state.codeBlockLines = []
        state.codeBlockLang = ''
        state.inCodeBlock = false
      } else {
        state.codeBlockLines.push(line)
      }
      continue
    }

    const codeBlockStart = /^```(\w*)/.exec(line.trim())
    if (codeBlockStart) {
      flushList(state)
      flushTable(state)
      state.inCodeBlock = true
      state.codeBlockLang = codeBlockStart[1] ?? ''
      state.codeBlockLines = []
      continue
    }

    // --- Table handling ---
    if (isTableLine(line)) {
      flushList(state)
      if (!state.inTable) {
        state.inTable = true
        state.tableLines = []
      }
      // Skip pure separator lines from being added as data but keep for detection
      state.tableLines.push(line)
      continue
    } else if (state.inTable) {
      flushTable(state)
    }

    // --- Headings ---
    const h1Match = /^#\s+(.+)$/.exec(line)
    if (h1Match) {
      flushList(state)
      if (!firstH1Skipped) {
        // Skip the first H1 - it goes in the header section
        firstH1Skipped = true
        continue
      }
      if (state.inAdrBlock) flushAdrBlock(state)
      state.outputLines.push(`<h1>${applyInlineFormatting(h1Match[1])}</h1>`)
      continue
    }

    const h2Match = /^##\s+(.+)$/.exec(line)
    if (h2Match) {
      flushList(state)
      if (state.inAdrBlock) flushAdrBlock(state)
      state.outputLines.push(`<h2>${applyInlineFormatting(h2Match[1])}</h2>`)
      continue
    }

    const h3Match = /^###\s+(.+)$/.exec(line)
    if (h3Match) {
      flushList(state)
      const headingText = h3Match[1]
      const isAdr = /^ADR-\d+:/.test(headingText)

      if (isAdr) {
        // Close any existing adr-block before opening a new one
        if (state.inAdrBlock) flushAdrBlock(state)
        state.outputLines.push('<div class="adr-block">')
        state.outputLines.push(`<h3>${applyInlineFormatting(headingText)}</h3>`)
        state.inAdrBlock = true
      } else {
        if (state.inAdrBlock) flushAdrBlock(state)
        state.outputLines.push(`<h3>${applyInlineFormatting(headingText)}</h3>`)
      }
      continue
    }

    // --- HR ---
    if (/^---+$/.test(line.trim())) {
      flushList(state)
      if (state.inAdrBlock) flushAdrBlock(state)
      state.outputLines.push('<hr>')
      continue
    }

    // --- Blockquote ---
    const bqMatch = /^>\s*(.*)$/.exec(line)
    if (bqMatch) {
      flushList(state)
      state.outputLines.push(`<blockquote>${applyInlineFormatting(bqMatch[1])}</blockquote>`)
      continue
    }

    // --- Unordered list ---
    const liMatch = /^[-*]\s+(.+)$/.exec(line)
    if (liMatch) {
      if (!state.inList) {
        state.inList = true
        state.listLines = []
      }
      state.listLines.push(line)
      continue
    } else if (state.inList) {
      flushList(state)
    }

    // --- Blank line ---
    if (line.trim() === '') {
      // Flush open blocks on blank line
      flushList(state)
      continue
    }

    // --- Regular paragraph line ---
    // If it is a separator-only table line that somehow slipped through, skip it
    if (isSeparatorLine(line)) continue

    state.outputLines.push(`<p>${applyInlineFormatting(line)}</p>`)
  }

  // Flush anything still open
  flushList(state)
  flushTable(state)
  if (state.inAdrBlock) flushAdrBlock(state)

  return state.outputLines.join('\n')
}

export function generateHtmlExport(content: string, projectName?: string): string {
  const resolvedProjectName = projectName ?? extractProjectName(content)
  const dateStr = formatDate(new Date())
  const bodyHtml = convertMarkdownToHtml(content)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(resolvedProjectName)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="header">
    <div class="header-meta">Architecture Blueprint - Generated by Arki</div>
    <h1>${escapeHtml(resolvedProjectName)}</h1>
    <div class="header-meta">${dateStr}</div>
  </div>
  ${bodyHtml}
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' })</script>
</body>
</html>`
}
