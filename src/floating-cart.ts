
import {
  cartOperations,
  type PriceGroup,
  type CartOperations,
  type CartHandleItem,
  type CartHandleResponse,
  type CartHandleOperations,
} from '../types/cart'

import {
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  getCartHandlerPath,
} from '../utils/endpoint-state'

import {
  postErrorResponse,
  buildRequestOptions,
  postSuccessResponse,
} from '../utils/requestResponse'

import {
  NULL_VALUE,
  XANO_BASE_URL,
  CART_SWITCH_CLASS,
  GENERAL_HIDDEN_CLASS,
} from '../utils/consts'

import {
  type CartResume,
  type FloatingCartState,
  type GroupFloatingCartState,
} from '../types/floating-cart'

import {
  trim,
  hasClass,
  addClass,
  stringify,
  attachEvent,
  toggleClass,
  querySelector,
  changeTextContent,
} from '../utils/dom'

import {
  dispatchCementinaCartItemsChange, dispatchCementinaCartToggle,
} from '../utils/events'

import {
  USDFormatter,
} from '../utils/mask'

import {
  decimalRound,
} from '../utils/math'

import {
  HttpMethod,
} from '../types/http'

const cart = querySelector<'div'>('#carrinho-flutuante')

const CART_BASE_URL = `${XANO_BASE_URL}/api:TDNSUlLK`
const FLOATING_CART_BASE_URL = `${XANO_BASE_URL}/api:N7afyK87`

const cartItemTemplate = querySelector<'div'>('[data-wtf-floating-cart-item]')
const cartItemsWrapper = querySelector<'div'>('[data-wtf-floating-cart-item-wrapper]')

const cartTotalElement = querySelector<'div'>('[data-wtf-floating-cart-total]')

const _state: FloatingCartState = {
  cart: NULL_VALUE,
  fetched: NULL_VALUE,
  isPending: false,
  isCartOpened: true,
  shippingPrice: NULL_VALUE,
}

const state = new Proxy(_state, {
  set <K extends keyof FloatingCartState> (
    target: FloatingCartState,
    key: K,
    value: FloatingCartState[K],
  ) {
    const isApplied = Reflect.set(target, key, value)

    switch (key) {
      case 'cart':
        renderCart()
        renderFinalPrices()
        dispatchCementinaCartItemsChange({
          cart_items: target.cart?.cart_items ?? 0,
        })
        break
      case 'isCartOpened':
        {
          refreshCartItems()
        }
        break
    }

    return isApplied
  },
}) as GroupFloatingCartState

async function refreshCartItems (): Promise<void> {
  if (!state.isCartOpened || state.isPending) return

  state.isPending = true

  const response = await getCartProducts()

  state.fetched ??= true
  state.isPending = false

  if (!response.succeeded) {
    // TODO: tratar e exibir o erro
    return
  }

  state.cart = response.data
}

async function getCartProducts <T extends CartHandleResponse> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar o seu carrinho'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${CART_BASE_URL}/cart/get/${cartPath}`, {
      ...buildRequestOptions(),
      priority: 'high',
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call(response, error?.message ?? defaultErrorMessage)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function getCartResume <T extends CartResume> (): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha na captura'

  try {
    const response = await fetch(`${FLOATING_CART_BASE_URL}/cart/get/resume`, {
      ...buildRequestOptions(),
      priority: 'high',
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call(response, error?.message ?? defaultErrorMessage)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function updateCartProducts <T extends CartHandleResponse> (item: CartHandleItem, operation: CartHandleOperations): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar o seu carrinho'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${CART_BASE_URL}/cart/handle/${cartPath}`, {
      ...buildRequestOptions([], HttpMethod.POST),
      priority: 'high',
      keepalive: true,
      body: stringify({
        item,
        operation,
      }),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
      >(response, error?.message ?? defaultErrorMessage)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function execCartAction (
  this: MouseEvent,
  operation: Exclude<CartHandleOperations, CartOperations["ADD"]>,
  payload: Omit<CartHandleItem, 'quantity'>,
): Promise<void> {
  this.preventDefault()
  this.stopPropagation()

  await handleProductChangeQuantity(operation, payload)
}

async function handleProductChangeQuantity (
  operation: Exclude<CartHandleOperations, CartOperations["ADD"]>,
  payload: Omit<CartHandleItem, 'quantity'>,
) {
  if (state.isPending) return

  state.isPending = true

  const response = await updateCartProducts({
    ...payload,
    quantity: 1,
  }, operation)

  state.isPending = false

  if (!response.succeeded) return

  state.cart = response.data
}

function renderCart (): void {
  if (!cartItemTemplate || !cartItemsWrapper) return

  const {
    cart,
  } = state

  if (!cart) return

  const {
    items,
    cart_items,
  } = cart

  const hasNoItems = cart_items === 0
  toggleClass(cartTotalElement, GENERAL_HIDDEN_CLASS, hasNoItems)

  const cartFragment = document.createDocumentFragment()

  const productEventMap: [Exclude<CartHandleOperations, CartOperations["ADD"]>, string][] = [
    [cartOperations.DELETE, 'data-wtf-floating-cart-item-remove'],
    [cartOperations.INCREASE, 'data-wtf-floating-cart-item-plus-button'],
    [cartOperations.DECREASE, 'data-wtf-floating-cart-item-minus-button'],
  ]

  for (const { quantity, price, full_price, name, sku_id, webflow_id } of items) {
    const template = cartItemTemplate.cloneNode(true) as HTMLElement

    renderProductPrices(
      {
        price,
        full_price,
      },
      template,
    )

    changeTextContent(
      querySelector('[data-wtf-floating-cart-item-product-name]', template),
      trim(name),
    )

    changeTextContent(
      querySelector('[data-wtf-floating-cart-item-quantity]', template),
      quantity,
    )

    const changeCartPayload: Omit<CartHandleItem, 'quantity'> = {
      webflow_id,
      public_id: sku_id,
    }

    for (const [operation, elementTrigger] of productEventMap) {
      const triggerElement = querySelector(`[${elementTrigger}]`, template)

      if (operation === cartOperations.INCREASE && quantity >= 10) {
        addClass(triggerElement, 'onedge')

        continue
      }

      attachEvent(
        triggerElement,
        'click',
        (e: MouseEvent) => execCartAction.call(e, operation, changeCartPayload),
      )
    }

    cartFragment.appendChild(template)
  }

  cartItemsWrapper.replaceChildren(cartFragment)
}

function renderProductPrices (price: PriceGroup, template: HTMLElement): void {
  const finalPriceElement = querySelector<'div'>('[data-wtf-floating-cart-item-product-price]', template)

  changeTextContent(
    finalPriceElement,
    USDFormatter.format(
      decimalRound(price.price / 100, 2)
    ),
  )
}

function renderFinalPrices (): void {
  const {
    cart,
  } = state

  if (!cart) return

  const {
    order_price,
  } = cart

  changeTextContent(
    cartTotalElement,
    USDFormatter.format(
      order_price
        ? decimalRound(order_price / 100, 2)
        : 0,
    )
  )
}

window.addEventListener('cementina-cart-toggle', async event => {
  const {
    isOpened,
    refreshRequired = false,
  } = event.detail

  toggleClass(cart, CART_SWITCH_CLASS)

  if (refreshRequired) {
    // ativa o loader da página
    await refreshCartItems()
  }

  state.isCartOpened = isOpened ?? !state.isCartOpened
})

window.addEventListener('cementina-cart-items-change', event => {
  const {
    cart_items = 0,
  } = event.detail

  changeTextContent(
    querySelector('[data-wtf-floating-cart-items-indicator]'),
    cart_items,
  )
})

getCartResume().then(response => {
  if (!response.succeeded) return

  dispatchCementinaCartItemsChange(response.data)
})

const cartObserver = new MutationObserver(mutations => {
  // Observer será aplicado em apenas um elemento
  const _cart = mutations[0].target as HTMLElement

  const hasClassInCart = hasClass(_cart, CART_SWITCH_CLASS)

  if (state.isCartOpened === hasClassInCart) return

  state.isCartOpened = hasClassInCart

  window.scrollTo({
    top: 0,
    behavior: 'instant',
  })

  document.body.style.overflow = hasClassInCart
    ? 'hidden'
    : 'unset'
})

if (cart) {
  cartObserver.observe(cart, {
    attributes: true,
    attributeFilter: [
      'class',
    ],
  })
}

document.querySelectorAll<HTMLElement>('[data-wtf-botao-carrinho-flutuante]').forEach(el => {
  attachEvent(el, 'click', () => {
    dispatchCementinaCartToggle({
      isOpened: true,
      refreshRequired: true,
    })
  }, {
    passive: true,
  })
})

// refreshCartItems().then(() => {
//   state.isCartOpened = false
//
//   removeClass(cart, GENERAL_HIDDEN_CLASS)
// })
