
import {
  EMPTY_STRING,
  NULL_VALUE,
  SLASH_STRING,
  XANO_BASE_URL,
  GENERAL_HIDDEN_CLASS,
} from '../utils/consts'

import {
  getCartHandlerPath,
} from '../utils/endpoint-state'

import {
  postErrorResponse,
  postSuccessResponse,
  buildRequestOptions,
} from '../utils/requestResponse'

import {
  ResponsePattern,
  FunctionErrorPattern,
  ResponsePatternCallback,
  FunctionSucceededPattern,
} from '../types/global'

import {
  SKU,
  ResumedSKU,
  ProductState,
  ProductStateDynamic,
  SingleProductResponse,
  SingleProductShipment,
  SingleProductShipmentParams,
} from '../types/single-product-page'

import {
  addClass,
  toggleClass,
  buildURL,
  stringify,
  objectSize,
  attachEvent,
  createElement,
  querySelector,
  getTextContent,
  isInputInstance,
  changeTextContent,
  cloneNodeAttributes, removeClass,
} from '../utils/dom'

import {
  clamp,
  decimalRound,
} from '../utils/math'

import {
  USDFormatter,
} from '../utils/mask'

import {
  priceType,
} from '../types/prices'

import {
  type CartHandleItem,
  type CartHandleParams,
  type CartHandleResponse,
  cartOperations,
} from '../types/cart'

import {
  HttpMethod,
} from '../types/http'
import {
  dispatchCementinaCartItemsChange,
  dispatchCementinaCartToggle,
  pageLoaderListener,
  setPageLoader
} from "../utils/events";
import {loaderElement} from "../types/page-loader";

const slug = location.pathname.split(SLASH_STRING).at(-1)

if (!slug) {
  throw new Error('Product identifier not found')
}

const mapColors = [
  {
    id: 'base',
    color: 'default',
  },

  {
    id: 'color-1',
    color: 'swisscoffee',
  },

  {
    id: 'color-2',
    color: 'balboamist',
  },

  {
    id: 'color-3',
    color: 'annapolisgray',
  },

  {
    id: 'color-4',
    color: 'cumuluscloud',
  },

  {
    id: 'color-5',
    color: 'thunder',
  },

  {
    id: 'color-6',
    color: 'cobblestone',
  },
]

const variationsContainerElement = querySelector<'div'>('#color-variations-list')

const basePriceViewElement = querySelector<'div'>('#spp-base-price-view')

const calculateDeliveryPriceButton = querySelector<'div'>('[data-wtf-calculate-shipping]')

const zipCodeForm = querySelector<'div'>('#spp-cep-parent')
const zipCodeField = querySelector<'input'>('[data-wtf-cep-field]')

const shippingErrorMessageSection = querySelector<'div'>('#spp-mensagem-de-erro-campo-de-cep')

const shippingCostSection = querySelector('#spp-custo-do-frete-bloco')
const shippingPrice = querySelector('#spp-custo-do-frete')

attachEvent(querySelector('[data-wtf-spp-decrement-button]'), 'click', (): void => {
  changeQuantity(-1)
})

attachEvent(querySelector('[data-wtf-spp-increment-button]'), 'click', (): void => {
  changeQuantity(1)
})

// attachEvent(querySelector('[data-wtf-add-to-cart]'), 'click', async () => {
// attachEvent(querySelector('[data-wtf-total-price]'), 'click', async () => {
//   await acquireItem(false)
// })

attachEvent(calculateDeliveryPriceButton, 'click', () => {
  toggleZipCodeSectionVisibility(true)
})

attachEvent(zipCodeField, 'keyup', async (e): Promise<void> => {
  if (!e.isTrusted || e.key !== 'Enter') return

  const target = e.target

  if (!isInputInstance(target)) return

  const response = await getShipmentResume(target.value)

  if (!response.succeeded) {
    setTimeout(() => {
      removeClass(calculateDeliveryPriceButton, GENERAL_HIDDEN_CLASS)

      showShippingErrorMessage(EMPTY_STRING, false)
    }, 4E3)

    addClass(zipCodeForm, GENERAL_HIDDEN_CLASS)

    return showShippingErrorMessage(response.message)
  }

  state.productShipment = response.data
})

const state = new Proxy<ProductState & Partial<ProductStateDynamic>>(
  {
    quantity: 1,
    colorSkus: [],
    webflow_id: NULL_VALUE,
    selectedSku: NULL_VALUE,
    productShipment: NULL_VALUE,
  },

  {
    get (target: ProductState, key: keyof (ProductState & ProductStateDynamic)) {
      switch (key) {
        case priceType.PRICE:
        case priceType.FULL_PRICE:
          {
            const sku = getSelectedSku()

            if (!sku) return 0

            return decimalRound(sku.price / 100, 2)
          }
        case 'final_price':
          {
            const {
              quantity,
            } = target

            const sku = getSelectedSku()

            if (!sku) return 0

            return sku.price * quantity
          }
      }

      return Reflect.get(target, key)
    },

    set (target: ProductState, key: keyof ProductState, value: unknown, receiver: ProductState): boolean {
      const hasApplied = Reflect.set(target, key, value)

      if (!hasApplied) return false

      switch (key) {
        case 'quantity':
          {
            renderQuantity()
            renderFinalPrice()
            receiver.productShipment = NULL_VALUE
          }
          break
        case 'colorSkus':
          {
            receiver.selectedSku = (value as SKU[]).at(0)?.public_id ?? NULL_VALUE
          }
          break
        case 'selectedSku':
          {
            renderSelectedSKUPrices()
            renderFinalPrice()
            renderColorVariations()
          }
          break
        case 'productShipment':
          {
            renderFinalPrice()

            addClass(zipCodeForm, GENERAL_HIDDEN_CLASS)
            toggleShippingPrice(state.productShipment?.amount, true)
          }
      }

      return hasApplied
    },
  }
)

const priority: RequestPriority = 'high'

function renderSelectedSKUPrices (): void {
  const selectedSku = getSelectedSku()

  if (!selectedSku) return

  changeTextContent(
    basePriceViewElement,
    USDFormatter.format(decimalRound(selectedSku.price / 100, 2)).replace('$', EMPTY_STRING),
  )
}

function renderQuantity (): void {
  changeTextContent(
    document.getElementById('spp-quantity-view'),
    state.quantity,
  )
}

function renderFinalPrice (): void {
  const prices: number[] = [
    state.final_price ?? 0,
    state.productShipment?.amount ?? 0,
  ]

  changeTextContent(
    querySelector('[data-wtf-total-price]'),
    USDFormatter.format(
      decimalRound(prices.reduce((sum, value) => sum + value, 0) / 100, 2),
    ),
  )
}

function toggleShippingPrice (price: number = 0, show: boolean = true): void {
  changeTextContent(
    shippingPrice,
    show
      ? USDFormatter.format(decimalRound(price / 100, 2))
      : EMPTY_STRING,
  )

  toggleClass(shippingCostSection, GENERAL_HIDDEN_CLASS, !show)
}

function showShippingErrorMessage (message: string, show: boolean = true): void {
  changeTextContent(
    querySelector('strong', shippingErrorMessageSection),
    show
      ? message ?? 'Please, try again later.'
      : EMPTY_STRING,
  )

  toggleClass(shippingErrorMessageSection, GENERAL_HIDDEN_CLASS, !show)
}

function toggleZipCodeSectionVisibility (show: boolean): void {
  toggleClass(calculateDeliveryPriceButton, GENERAL_HIDDEN_CLASS, show)

  toggleClass(zipCodeForm, GENERAL_HIDDEN_CLASS, !show)
}

function createVariationNode (color: string, selected: boolean = false, callback: VoidFunction): HTMLDivElement {
  const variationNode = document.createElement('div')

  addClass(variationNode, 'produto_valoresitem_cores')
  addClass(variationNode, color)

  if (toggleClass(variationNode, 'selecionado', selected)) return variationNode

  attachEvent(variationNode, 'click', () => callback(), {
    passive: true,
  })

  return variationNode
}

function handleChangeSelectedVariation (publicId: string): void {
  if (state.selectedSku === publicId) return

  state.selectedSku = publicId
  state.quantity = 1
}

function renderColorVariations (): void {
  if (!variationsContainerElement) return

  const fragment = document.createDocumentFragment()

  const {
    colorSkus,
    selectedSku,
  } = state

  for (const variation of colorSkus) {
    if (variation.variation_type !== 'color') continue

    const {
      public_id,
    } = variation

    fragment.appendChild(
      createVariationNode(
        variation.variation_item,
        public_id === selectedSku,
        () => handleChangeSelectedVariation(public_id),
      )
    )
  }

  variationsContainerElement.replaceChildren(fragment)
}

function changeQuantity (value: number): void {
  const newQuantity = clamp(1, 10, state.quantity + value)

  if (newQuantity === state.quantity) return

  state.quantity = newQuantity
}

function getSelectedSku (): ResumedSKU | undefined {
  const {
    colorSkus,
    selectedSku,
  } = state

  if (!selectedSku || objectSize(colorSkus) < 1) return

  return colorSkus.find(sku => sku.public_id === selectedSku)
}

async function replaceActionCtas (): Promise<void> {
  const buyNowCta = querySelector('#buynowcta')

  const addToCartCta = querySelector('#addtocartcta')

  const fragment = document.createDocumentFragment()

  const buttonBuilder = () => createElement('button')

  if (buyNowCta) {
    const button = buttonBuilder()

    changeTextContent(
      cloneNodeAttributes(buyNowCta, button, [
        'id',
        'class',
      ]),
      getTextContent(buyNowCta),
    )

    attachEvent(button, 'click', () => acquireItem(true))

    fragment.appendChild(button)
  }

  if (addToCartCta) {
    const button = buttonBuilder()

    changeTextContent(
      cloneNodeAttributes(addToCartCta, button, [
        'id',
        'class',
      ]),
      getTextContent(addToCartCta),
    )

    attachEvent(button, 'click', () => acquireItem(false))

    fragment.appendChild(button)
  }

  buyNowCta?.parentNode?.replaceChildren(fragment)
}

async function acquireItem (immediate: boolean = false): Promise<void> {
  setPageLoader({
    loading: true,
  })

  const {
    quantity,
    webflow_id,
    selectedSku,
  } = state

  if (!selectedSku) {
    throw new Error('No SKU founded')
  }

  if (!webflow_id) {
    throw new Error('The product id is missing')
  }

  const addToCartParams = ({
    quantity,
    webflow_id,
    public_id: selectedSku,
  } satisfies CartHandleItem)

  const response = await addProductToCart({
    immediate,
    item: addToCartParams,
    operation: cartOperations.ADD,
  })

  if (!response.succeeded) {
    setPageLoader({
      loading: false,
    })

    return alert(response.message ?? 'Não foi possível adicionar o produto no seu carrinho')
  }

  state.quantity = 1

  dispatchCementinaCartItemsChange({
    cart_items: response.data.cart_items,
  })

  if (immediate) {
    alert('direcionar para o checkout')
  }

  dispatchCementinaCartToggle({
    isOpened: true,
    refreshRequired: true,
  })

  setPageLoader({
    loading: false,
  })
}

async function getProduct <T extends SingleProductResponse> (slug: string): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha ao buscar os dados do usuário'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:eY0RrQ9C/product/${slug}/${cartPath}`, {
      ...buildRequestOptions(),
      priority,
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
      >(response, error?.message ?? defaultErrorMessage, true)
    }

    const data: T = await response.json()

    return postSuccessResponse.call<
      Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
    >(response, data)
  } catch (e) {
    return postErrorResponse(defaultErrorMessage)
  }
}

async function addProductToCart <T extends CartHandleResponse> (payload: CartHandleParams): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha na adição do produto'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:TDNSUlLK/cart/handle/${cartPath}`, {
      ...buildRequestOptions([], HttpMethod.POST),
      body: stringify<CartHandleParams>(payload),
      priority,
      keepalive: true, // O produto será adicionado ao carrinho mesmo que o usuário realize uma navegação enquanto a requisição ainda está em andamento
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

async function getShipmentResume <T extends SingleProductShipment> (zipCode: string): Promise<ResponsePattern<T>> {
  const defaultErrorMessage = 'Houve uma falha na captura da simulação de entrega'

  const cartPath = getCartHandlerPath()

  try {
    const response = await fetch(`${XANO_BASE_URL}/api:eY0RrQ9C/product/${state.webflow_id}/quotation/${cartPath}`, {
      ...buildRequestOptions([], HttpMethod.POST),
      priority,
      body: stringify<Pick<SingleProductShipmentParams, 'zip_code' | 'quantity'>>({
        zip_code: zipCode,
        quantity: state.quantity,
      }),
    })

    if (!response.ok) {
      const error = await response.json()

      return postErrorResponse.call<
        Response, [string], FunctionErrorPattern
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

function handleIncomingProduct (product: ResponsePattern<SingleProductResponse>): void {
  if (!product.succeeded) {
    location.href = buildURL(SLASH_STRING, {
      reason: 'product_not_found',
    })

    return
  }

  const {
    webflow_id,
    variations,
  } = product.data

  const colorVariants = variations?.color ?? []

  if (!colorVariants) return

  state.webflow_id = webflow_id
  state.colorSkus  = colorVariants

  replaceActionCtas()

  setPageLoader()
}

pageLoaderListener([
  (loading: boolean) => toggleClass(loaderElement, GENERAL_HIDDEN_CLASS, !loading),
])

Promise.allSettled([
  getProduct(slug).then(handleIncomingProduct),
])

window.addEventListener('pageshow', (e: PageTransitionEvent) => {
  if (e.persisted) location.reload()
})
