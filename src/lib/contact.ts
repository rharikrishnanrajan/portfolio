import { z } from 'zod'
import type { ContactInsertErrorKind } from './supabase'

export const CONTACT_COOLDOWN_MS = 60_000
export const MIN_FORM_FILL_MS = 3_000

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter your name.')
    .max(200, 'Name must be 200 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(320, 'Email address is too long.')
    .email('Please enter a valid email address.'),
  subject: z
    .string()
    .trim()
    .max(300, 'Subject must be 300 characters or fewer.'),
  body: z
    .string()
    .trim()
    .min(1, 'Please enter a message.')
    .max(5000, 'Message must be 5000 characters or fewer.'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export function mapContactErrorMessage(kind?: ContactInsertErrorKind): string {
  switch (kind) {
    case 'rate_limit':
      return 'Too many messages right now. Please try again later.'
    case 'validation':
      return 'Please check your details and try again.'
    case 'network':
      return 'Unable to reach the server. Please check your connection and try again.'
    default:
      return 'Could not send your message right now. Please try again later.'
  }
}
