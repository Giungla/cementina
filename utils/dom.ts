
import {
  type HTMLAttributes,
} from 'vue'

import {
  type Nullable,
} from '../types/global'

import {
  NULL_VALUE,
  EMPTY_STRING,
} from './consts'

export function numberOnly (value: string): string {
  return value.replace(/\D+/g, EMPTY_STRING)
}

export function objectSize <T extends string | any[]> (value: T): number {
  return value.length
}

export function stringify <T extends object> (value: T): string {
  return JSON.stringify(value)
}

export function trim (value: string): string {
  return value.trim()
}

export function splitText (value: string, separator: string | RegExp, limit?: number): string[] {
  return value.split(separator, limit)
}

export function buildURL (path: string, query: Record<string, string> = {}): string {
  const baseURL = new URL(`${location.protocol}//${location.hostname}`)

  const nextPage = new URL(path, baseURL)

  for (const [key, value] of Object.entries(query)) {
    nextPage.searchParams.set(key, value)
  }

  return nextPage.toString()
}

export function isNull (v: any): v is null {
  return v === NULL_VALUE
}
export function querySelector<
  K extends keyof HTMLElementTagNameMap,
  T extends HTMLElementTagNameMap[K] | Element | null = HTMLElementTagNameMap[K] | null
>(
  selector: K | string,
  node: HTMLElement | Document | null = document
): T {
  if (!node) return NULL_VALUE as T

  return node.querySelector(selector as string) as T
}

export function attachEvent <
  T extends HTMLElement | Document,
  K extends T extends HTMLElement
    ? keyof HTMLElementEventMap
    : keyof DocumentEventMap
> (
  node: T | null,
  eventName: K,
  callback: (event: T extends HTMLElement
    ? HTMLElementEventMap[K extends keyof HTMLElementEventMap ? K : never]
    : DocumentEventMap[K extends keyof DocumentEventMap ? K : never]
  ) => void,
  options?: boolean | AddEventListenerOptions
): VoidFunction | void {
  if (!node) return

  node.addEventListener(eventName, callback as EventListener, options)

  return () => node.removeEventListener(eventName, callback as EventListener, options)
}

export function changeTextContent (element: ReturnType<typeof querySelector>, textContent: string | number | boolean) {
  if (!element) return

  element.textContent = typeof textContent === 'string'
    ? textContent
    : textContent.toString()
}

export function hasClass (element: ReturnType<typeof querySelector>, className: string): boolean {
  if (!element) return false

  return element.classList.contains(className)
}

export function addClass (element: ReturnType<typeof querySelector>, ...className: string[]): void {
  if (!element) return

  element.classList.add(...className)
}

export function removeClass (element: ReturnType<typeof querySelector>, ...className: string[]): void {
  if (!element) return

  element.classList.remove(...className)
}

export function toggleClass (element: ReturnType<typeof querySelector>, className: string, force?: boolean): boolean {
  if (!element) return false

  return element.classList.toggle(className, force)
}

export function isInputInstance (value: any): value is HTMLInputElement {
  return value instanceof HTMLInputElement
}

export function addAttribute (element: ReturnType<typeof querySelector>, qualifiedName: keyof HTMLAttributes, value: string): void {
  if (!element) return

  element.setAttribute(qualifiedName, value)
}

export function removeAttribute (element: ReturnType<typeof querySelector>, qualifiedName: string): void {
  if (!element) return

  element.removeAttribute(qualifiedName)
}

export function getAttribute (element: ReturnType<typeof querySelector>, qualifiedName: string): Nullable<string> {
  if (!element) return NULL_VALUE

  return element.getAttribute(qualifiedName)
}

export function getTextContent (element: ReturnType<typeof querySelector>): string {
  return element?.textContent ?? EMPTY_STRING
}

export function cloneNodeAttributes <T extends HTMLElement> (from: HTMLElement, to: T, attributes: (keyof HTMLAttributes)[]): T {
  for (const attribute of attributes) {
    addAttribute(
      to,
      attribute,
      getAttribute(from, attribute),
    )
  }

  return to
}

export function createElement <T extends keyof HTMLElementTagNameMap> (tagName: T): HTMLElementTagNameMap[T] {
  return document.createElement(tagName)
}
