
export type ParsedMarkdown = {
    title: string
    subtitle: string
    content: string
}

export function parseMarkdown(markdown: string): ParsedMarkdown {
    const lines = markdown.split('\n')
    let title = ''
    let subtitle = ''
    let content = ''

    if (lines[0] === '---') {
        let i = 1
        while (i < lines.length && lines[i] !== '---') {
            const line = lines[i]
            if (line.startsWith('title:')) {
                title = line.replace('title:', '').trim().replace(/^"(.*)"$/, '$1')
            } else if (line.startsWith('subtitle:')) {
                subtitle = line.replace('subtitle:', '').trim().replace(/^"(.*)"$/, '$1')
            }
            i++
        }
        content = lines.slice(i + 1).join('\n').trim()
    } else {
        content = markdown
    }

    return { title, subtitle, content }
}
