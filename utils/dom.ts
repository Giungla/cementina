
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

export const SCROLL_INTO_VIEW_DEFAULT_ARGS: ScrollIntoViewOptions = {
  block: 'center',
  behavior: 'smooth',
}

export function focusInput (input: ReturnType<typeof querySelector<'input'>>, options?: FocusOptions) {
  if (!input) return

  input.focus(options)
}

export function numberOnly (value: string): string {
  return value.replace(/\D+/g, EMPTY_STRING)
}

export function objectSize <T extends string | any[]> (value: T): number {
  return value.length
}

export function replaceDuplicatedSpaces (value: string): string {
  return value.replace(/\s{2,}/g, ' ')
}

export function regexTest (regex: RegExp | (() => RegExp), value: string): boolean {
  const rule = typeof regex === 'function'
    ? regex()
    : regex

  return rule.test(value)
}

export function normalizeText (text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, EMPTY_STRING)
    .replace(/[\u200B-\u200D\uFEFF]/g, EMPTY_STRING)
    .replace(/[\u2060\u034F]/g, EMPTY_STRING)
}

export function toUpperCase (value: string): string {
  return value.toUpperCase()
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

export function join (v: unknown[], separator: string = EMPTY_STRING): string {
  return v.join(separator)
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

export function isFunction (v: unknown): v is Function {
  return typeof v === 'function'
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
      getAttribute(from, attribute) ?? EMPTY_STRING,
    )
  }

  return to
}

export function scrollIntoView (element: ReturnType<typeof querySelector>, args: ScrollIntoViewOptions): void {
  if (!element) return

  element.scrollIntoView(args)
}

export function preventEvent (e: Event): void {
  e.preventDefault()
}

export function createElement <T extends keyof HTMLElementTagNameMap> (tagName: T): HTMLElementTagNameMap[T] {
  return document.createElement(tagName)
}

export function EMAIL_REGEX_VALIDATION (): RegExp {
  return /^(([\p{L}\p{N}!#$%&'*+\/=?^_`{|}~-]+(\.[\p{L}\p{N}!#$%&'*+\/=?^_`{|}~-]+)*)|("[\p{L}\p{N}\s!#$%&'*+\/=?^_`{|}~.-]+"))@(([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,63}|(\[(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\]))$/u
}

export function DATE_REGEX_VALIDATION (): RegExp {
  return /^\d{2}\/\d{2}\/\d{4}$/
}

export function PARTIAL_NAME_REGEX_VALIDATION (): RegExp {
  return /^(\w{2,})$/
}

export function FULLNAME_REGEX_VALIDATION (): RegExp {
  return /^(\w{2,})(\s+(\w+))+$/
}

export function ZIP_CODE_REGEX_VALIDATION (): RegExp {
  return /^\d{5}(-\d{4})?$/
}

/**
 * Verifica se o telefone informado atende o padrão (000) 000-0000
 */
export function PHONE_REGEX_VALIDATION (): RegExp {
  return /^\(\d{3}\)\s\d{3}-\d{4}$/
}

export function disposable (fn: VoidFunction): Disposable {
  return {
    [Symbol.dispose]: fn,
  }
}
