import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateHealthCardId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  return `AH-${timestamp.slice(-6)}-${random.toUpperCase()}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}