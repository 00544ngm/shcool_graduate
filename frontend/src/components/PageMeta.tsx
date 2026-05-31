import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description?: string
}

const SITE_NAME = '班级时光馆'

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`
  }, [title])

  useEffect(() => {
    if (!description) return
    const meta = document.querySelector('meta[name="description"]')
    const existing = meta || document.createElement('meta')
    existing.setAttribute('name', 'description')
    existing.setAttribute('content', description)
    if (!meta) document.head.appendChild(existing)
    return () => {
      if (!meta) existing.remove()
    }
  }, [description])

  return null
}
