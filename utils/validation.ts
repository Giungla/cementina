
import {
  SLASH_STRING,
} from './consts'

import {
  splitText,
} from './dom'

/**
 * Aplica formatação para uma data fornecida no padrão norte-americano (MM/DD/YYYY)
 */
export function isDateValid (date: string): boolean {
  const [
    month,
    day,
    fullYear,
  ] = splitText(date, SLASH_STRING).map(Number)

  // const parsedDate = new Date(`${fullYear}-${month}-${day}T00:00:00`)
  const parsedDate = new Date(Date.UTC(fullYear, month - 1, day))

  if (parsedDate.toString() === 'Invalid Date') return false

  const isSameDay   = parsedDate.getUTCDate() === Number(day)
  const isSameMonth = parsedDate.getUTCMonth() + 1 === Number(month)
  const isSameYear  = parsedDate.getUTCFullYear() === Number(fullYear)

  return isSameDay && isSameMonth && isSameYear
}
