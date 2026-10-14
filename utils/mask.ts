import {
  type Nullable,
} from '../types/global'

import {
  EMPTY_STRING,
  SLASH_STRING,
} from './consts'

import {
  objectSize,
} from './dom'

import {
  pushIf,
} from './array'

export const USDFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

export function maskZipCode (value: string): string {
  return value.replace(/^(\d{0,5})(\d{0,4})/, (
    _: string,
    g1: Nullable<string>,
    g2: Nullable<string>,
  ) => {
    const response: string[] = []

    for (const group of [g1, g2]) {
      pushIf(response, group, group)
    }

    return response.join('-')
  })
}

export function maskDate (value: string): string {
  return value.replace(/^(\d{0,2})(\d{0,2})(\d{0,4})/, (
    _: string,
    d1: Nullable<string>,
    d2: Nullable<string>,
    d3: Nullable<string>,
  ) => {
    return [d1, d2, d3]
      .filter(Boolean)
      .join(SLASH_STRING)
  })
}

export function maskPhoneNumber (value: string): string {
  const replacer = (
    _: string,
    d1: Nullable<string>,
    d2: Nullable<string>,
    d3: Nullable<string>,
  ) => {
    const response: string[] = []

    pushIf(response, `(${d1}`, d1)
    pushIf(response, `) ${d2}`, d2)
    pushIf(response, `-${d3}`, d3)

    return response.join(EMPTY_STRING)
  }

  return value.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, replacer)
}
