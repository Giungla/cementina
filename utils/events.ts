
import {
  type CartResume,
} from '../types/floating-cart'

import {
  type CementinaCartToggleDetail,
  type CementinaCartItemsChangeDetail,
} from '../types/events'

import {
  type PageLoader,
  loaderElement,
} from '../types/page-loader'

import {
  EMPTY_OBJECT,
} from './consts'

function dispatchEvent (event: CustomEvent): boolean {
  return window.dispatchEvent(event)
}

export function dispatchCementinaCartToggle (options: CementinaCartToggleDetail): void {
  const cementinaCartToggleEvent = new CustomEvent<CementinaCartToggleDetail>('cementina-cart-toggle', {
    detail: options,
  })

  dispatchEvent(cementinaCartToggleEvent)
}

export function dispatchCementinaCartItemsChange (cartResume: CartResume): void {
  const cementinaCartItemsChange = new CustomEvent<CementinaCartItemsChangeDetail>('cementina-cart-items-change', {
    detail: cartResume,
  })

  dispatchEvent(cementinaCartItemsChange)
}

export function setPageLoader (options?: PageLoader): boolean {
  if (!loaderElement) return false

  const loaderEvent = new CustomEvent<PageLoader>('cementina-loader', {
    detail: options,
  })

  return dispatchEvent(loaderEvent)
}

export function pageLoaderListener (subscribers: ((loading: boolean) => void)[]): void {
  window.addEventListener('cementina-loader', event => {
    const {
      loading = false,
    } = event?.detail ?? EMPTY_OBJECT

    for (const subscriber of subscribers) {
      subscriber?.(loading)
    }
  })
}
