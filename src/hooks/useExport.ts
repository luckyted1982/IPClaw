import { useState } from 'react'
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, BorderStyle, WidthType } from 'docx'

export function useExport() {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    return copied
  }

  const exportMD = (content: string, filename?: string) => {
    setExporting('md')
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `IPClaw_${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  const exportDOCX = async (content: string, filename?: string) => {
    setExporting('docx')
    try {
      const children: (Paragraph | Table)[] = []
      const lines = content.split('\n')
      
      let i = 0
      while (i < lines.length) {
        const line = lines[i]
        
        if (line.startsWith('## ')) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: line.slice(3), bold: true })],
          }))
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: line.slice(4), bold: true })],
          }))
        } else if (line.startsWith('**') && line.endsWith('**')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(2, -2), bold: true })],
          }))
        } else if (line.startsWith('> ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(2), italics: true })],
            indent: { left: 720 },
          }))
        } else if (line.match(/^\|.*\|$/)) {
          const headers = line.split('|').filter(cell => cell.trim())
          const rows: TableRow[] = []
          
          rows.push(new TableRow({
            children: headers.map(h => new TableCell({
              children: [new Paragraph(h.trim())],
              shading: { fill: 'E8E8E8' },
            })),
          }))
          
          i++
          while (i < lines.length && lines[i].match(/^\|.*\|$/)) {
            const cells = lines[i].split('|').filter(cell => cell.trim())
            rows.push(new TableRow({
              children: cells.map(c => new TableCell({
                children: [new Paragraph(c.trim())],
              })),
            }))
            i++
          }
          
          children.push(new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
          }))
          continue
        } else if (line.startsWith('```')) {
          i++
          const codeLines: string[] = []
          while (i < lines.length && !lines[i].startsWith('```')) {
            codeLines.push(lines[i])
            i++
          }
          children.push(new Paragraph({
            children: [new TextRun({ text: codeLines.join('\n'), font: 'Consolas', size: 22 })],
          }))
        } else if (line.trim()) {
          children.push(new Paragraph({
            children: [new TextRun(line)],
          }))
        }
        
        i++
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `IPClaw_${Date.now()}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export DOCX error:', error)
    }
    setExporting(null)
  }

  const exportPDF = (content: string, filename?: string) => {
    setExporting('pdf')
    const blob = new Blob([content], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `IPClaw_${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  const shareContent = (content: string, title?: string) => {
    if (navigator.share) {
      navigator.share({
        title: title || 'IPClaw 内容分享',
        text: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      })
    } else {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return {
    copyToClipboard,
    exportMD,
    exportDOCX,
    exportPDF,
    shareContent,
    copied,
    exporting,
  }
}