type SerializeInput = {
  title: string
  subtitle: string
  doc: Record<string, unknown>
}

export function serializeToMarkdown({ title, subtitle, doc }: SerializeInput) {
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `subtitle: "${subtitle}"`,
    '---',
    ''
  ].join('\n')

  const body = serializeNode(doc)
  return `${frontmatter}${body}`.trim() + '\n'
}

function serializeNode(node: any): string {
  if (!node) return ''
  if (Array.isArray(node)) return node.map(serializeNode).join('')
  if (node.type === 'text') return node.text || ''
  if (node.type === 'paragraph') return `${serializeNode(node.content || [])}\n\n`
  if (node.type === 'image') {
    const alt = node.attrs?.alt || ''
    const filename = node.attrs?.filename || ''
    return `![${alt}](./${filename})\n\n`
  }
  if (node.type === 'csvEmbed') {
    const filename = node.attrs?.filename || ''
    return `{{table: ${filename}}}\n\n`
  }
  return serializeNode(node.content || [])
}
