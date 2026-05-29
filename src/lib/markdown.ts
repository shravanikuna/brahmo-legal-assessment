import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
    breaks: true,
    gfm: true
})

export function renderMarkdown(content: string = '') {
    const rawHtml = marked.parse(content) as string
    return DOMPurify.sanitize(rawHtml)
}