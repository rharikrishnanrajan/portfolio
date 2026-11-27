import { createContext, useContext } from 'react'
import type { ContactInsertResult, ContactMessageInput } from '../lib/supabase'
import type { SiteContent, ThemeMode } from '../types/content'

export type ContentStatus = 'loading' | 'ready' | 'empty' | 'unavailable'
export type ContentSource = 'cache' | 'snapshot' | 'live' | 'none'

export interface ContentContextValue {
  content: SiteContent
  status: ContentStatus
  source: ContentSource
  isRefreshing: boolean
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleThemeMode: () => void
  retry: () => void
  sendContactMessage: (payload: ContactMessageInput) => Promise<ContactInsertResult>
  contentUpdateTrigger: number
}

export const ContentContext = createContext<ContentContextValue | null>(null)

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) {
    throw new Error('useContent must be used inside a ContentProvider')
  }
  return ctx
}
