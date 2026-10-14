
import {
  type DirectiveBinding,
  ref,
  createApp,
  // shallowRef,
  nextTick,
  defineComponent,
} from 'vue'

import {
  type OnCleanup,
} from '@vue/reactivity'

import {
  type IParsedAddress,
  type CheckoutAppData,
  type CheckoutAppSetup,
  type FeedableUserFields,
  type TokenizeCardResponse,
  type CheckoutInitialParams,
  type CheckoutInitialPayload,
  type CheckoutPaymentMethod,
  type RenderableProduct,
} from '../types/checkout.definition'

import {
  type SquarePayload,
} from '../types/square'

import {
  type Nullable,
  type ResponsePattern,
  type FunctionErrorPattern,
  type ResponsePatternCallback,
  type FunctionSucceededPattern,
} from '../types/global'

import {
  type Card,
  type Payments,
  type LineItem,
  type GooglePay,
  type ShippingOption,
  type CardFieldNames,
  type PaymentRequest,
  type ShippingContact,
  type PaymentRequestUpdate,
  type PaymentRequestOptions,
  type SuccessfulTokenResult,
  payments as SquarePaymentInstance,
} from '@square/web-sdk'

import {
  NULL_VALUE,
  DASH_STRING,
  SPACE_STRING,
  EMPTY_STRING,
  XANO_BASE_URL,
  SLASH_STRING,
  EMPTY_OBJECT,
  ZIPCODE_STORAGE_KEY,
  GENERAL_HIDDEN_CLASS,
} from '../utils/consts'

import {
  getCartHandlerPath,
} from '../utils/endpoint-state'

import {
  postErrorResponse,
  buildRequestOptions,
  postSuccessResponse,
} from '../utils/requestResponse'

import {
  SCROLL_INTO_VIEW_DEFAULT_ARGS,
  join,
  trim,
  isNull,
  buildURL,
  stringify,
  regexTest,
  disposable,
  isFunction,
  objectSize,
  focusInput,
  numberOnly,
  attachEvent,
  toUpperCase,
  toggleClass,
  preventEvent,
  normalizeText,
  scrollIntoView,
  isInputInstance,
  replaceDuplicatedSpaces,
  EMAIL_REGEX_VALIDATION,
  PHONE_REGEX_VALIDATION,
  ZIP_CODE_REGEX_VALIDATION,
  FULLNAME_REGEX_VALIDATION,
  PARTIAL_NAME_REGEX_VALIDATION,
} from '../utils/dom'

import {
  USDFormatter,
  maskDate,
  maskZipCode,
  maskPhoneNumber,
} from '../utils/mask'

import {
  decimalRound,
} from '../utils/math'

import {
  BLUR_EVENT,
  setPageLoader,
  pageLoaderListener,
} from '../utils/events'

import {
  loaderElement,
} from '../types/page-loader'

import {
  eventMap,
  cleanupDirective,
  buildMaskDirective,
} from '../utils/vue'

import {
  type ISingleValidateCheckout,
} from '../types/checkout'

import {
  pushIf,
  includes,
} from '../utils/array'

import {
  paymentType,
  type PaymentTypes,
} from '../utils/payment'

import {
  HttpMethod,
} from '../types/http'

import {
  type ResumedAddress,
} from '../utils/zippopotam'

import {
  type SquareCardResume,
  squareCardErrorMessages,
  reorderSquareMessagesByPriority,
} from '../utils/square'

import {
  statesAcronym,
  buildAddressesSet,
  buildAddressFieldValidator,
  buildResumedAddressFromAppState,
} from '../utils/address'

import {
  type ShippoAddress,
  type RecommendedAddress,
  type ShippoAddressInput,
  type ShippoPartiallyValid,
  type ShippoValidationResponse,
} from '../types/address'

import {
  deliveryType,
  type ShippoRate,
  type DeliveryPlace,
  type DeliveryTypes,
  type ShippoShipment,
  type ParsedShippoRate,
} from '../types/delivery'

import {
  deliveryPlaceObject,
} from '../utils/delivery'

import {
  delay,
} from '../utils/promise'

import {
  pluralize,
} from '../utils/pluralize'

import {
  type PaymentPayload,
  isDeliveryPlaceValid,
  outcomingDataError,
  outcomingDataSuccess,
} from '../utils/checkout'

function buildFieldValidation (
  field: Nullable<HTMLElement>,
  valid: boolean,
  ignoreIf: boolean = false,
): ISingleValidateCheckout {
  return {
    field,
    valid,
    ...(ignoreIf && ({ ignoreIf })),
  }
}

function paymentMethodObject (method: PaymentTypes, label: string): CheckoutPaymentMethod {
  return {
    method,
    label,
  }
}

const CHECKOUT_BASE_PATH = `${XANO_BASE_URL}/api:aQp-dj9m`

const CheckoutComponent = defineComponent({
  name: 'CheckoutComponent',

  setup (): CheckoutAppSetup {
    return {
      customerGivenName: ref<string>(EMPTY_STRING),
      customerFamilyName: ref<string>(EMPTY_STRING),
      customerMail: ref<string>(EMPTY_STRING),
      customerPhone: ref<string>(EMPTY_STRING),

      shippingAddressValidationMessage: ref<Nullable<string>>(NULL_VALUE),
      shippingRecommendedAddress: ref<Nullable<RecommendedAddress & Pick<ShippoPartiallyValid, 'validator'>>>(NULL_VALUE),
      resumedShippingAddress: ref<Nullable<string>>(NULL_VALUE),
      shippingRecipient: ref<string>(EMPTY_STRING),
      shippingStreetAddress: ref<string>(EMPTY_STRING),
      shippingStreetAddressLine2: ref<string>(EMPTY_STRING),
      shippingZipCode: ref<string>(EMPTY_STRING),
      shippingCity: ref<string>(EMPTY_STRING),
      shippingState: ref<string>(EMPTY_STRING),
      shippingAddressValidator: ref<Nullable<string>>(NULL_VALUE),

      billingAddressValidationMessage: ref<Nullable<string>>(NULL_VALUE),
      billingRecommendedAddress: ref<Nullable<RecommendedAddress & Pick<ShippoPartiallyValid, 'validator'>>>(NULL_VALUE),
      resumedBillingAddress: ref<Nullable<string>>(NULL_VALUE),
      billingZipCode: ref<string>(EMPTY_STRING),
      billingStreetAddress: ref<string>(EMPTY_STRING),
      billingStreetAddressLine2: ref<string>(EMPTY_STRING),
      billingCity: ref<string>(EMPTY_STRING),
      billingState: ref<string>(EMPTY_STRING),
      billingAddressValidator: ref<Nullable<string>>(NULL_VALUE),

      deliveryPlaceSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),
      deliveryPlaceMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      paymentMethodMessageRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      customerPersonalDataSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),
      customerNameRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerFamilyNameRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerMailRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      customerPhoneRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      squareCardWrapperRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      shippingAddressSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      shippingRecipientRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingZipCodeRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingStreetAddressRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingCityRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      shippingStateRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      billingAddressSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),
      resumedBillingAddressRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),
      billingZipCodeRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingStreetAddressRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingCityRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),
      billingStateRef: ref<Nullable<HTMLInputElement>>(NULL_VALUE),

      paymentMethods: ref<CheckoutPaymentMethod[]>([]),

      squareCardErrorField: ref<CardFieldNames[]>([]),
      isTokenizingCard: ref<boolean>(false),

      squareCardResume: ref<Nullable<SquareCardResume>>(NULL_VALUE),
      squareCardInstance: ref<Nullable<Card>>(NULL_VALUE),
      squareGooglePayInstance: ref<Nullable<GooglePay>>(NULL_VALUE),

      deliveryPlace: ref<Nullable<DeliveryTypes>>(NULL_VALUE),
      deliveryPlaces: ref<DeliveryPlace[]>([
        deliveryPlaceObject(deliveryType.SAME, 'Same as billing'),
        deliveryPlaceObject(deliveryType.DIFF, 'Use a different address'),
      ]),

      deliveryOptionsSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      orderErrorSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),

      orderResumeSectionRef: ref<Nullable<HTMLDivElement>>(NULL_VALUE),
    }
  },

  data (): CheckoutAppData {
    return {
      submitted: false,
      isSubmitting: false,
      isGettingDeliveryOptions: false,

      cart: NULL_VALUE,

      visitedFields: [],

      selectedPaymentMethod: NULL_VALUE,

      squareStoreInfo: NULL_VALUE,

      squarePayment: NULL_VALUE,

      squarePaymentToken: NULL_VALUE,

      deliveryOption: NULL_VALUE,
      deliveryOptions: NULL_VALUE,

      orderError: NULL_VALUE,
    }
  },

  async created (): Promise<void> {
    using dispose = disposable(() => {
      setPageLoader({
        loading: false,
      })
    })

    pageLoaderListener([
      (loading: boolean) => toggleClass(loaderElement, GENERAL_HIDDEN_CLASS, !loading),
    ])

    setPageLoader({
      loading: true,
    })

    const zipcode = numberOnly(localStorage.getItem(ZIPCODE_STORAGE_KEY) ?? EMPTY_STRING)

    await this.getData({
      zipcode: objectSize(zipcode) > 4
        ? zipcode
        : NULL_VALUE,
    }).then(async response => {
      if (!response.succeeded) {
        location.href = buildURL(SLASH_STRING, {
          reason: 'checkout_failed_to_fetch',
        })

        return
      }

      const {
        cart,
        user,
        square,
      } = response.data

      if (cart.cart_items < 1) {
        location.href = buildURL(SLASH_STRING, {
          reason: 'cart_empty',
        })

        return
      }

      if (user) {
        this.customerMail  = user.email
        this.customerPhone = user.telephone || EMPTY_STRING
      }

      this.cart            = cart
      this.squareStoreInfo = square

      await this.loadSquare(square)
    })
  },

  mounted () {
    scrollIntoView(document.body, {
      block: 'start',
      behavior: 'smooth',
    })
  },

  methods: {
    /**
     * Carrega uma instância da Square
     */
    async loadSquare ({ location_id, application_id }: SquarePayload): Promise<void> {
      const SquarePayment = await SquarePaymentInstance(application_id, location_id)

      if (!SquarePayment) return

      await SquarePayment.setLocale('en-US')

      this.squarePayment = SquarePayment

      const SquarePaymentRequestSquarePayment = SquarePayment.paymentRequest(this.squarePaymentRequestOptions)

      await Promise.allSettled([
        this.verifyGooglePaySupport(SquarePayment, SquarePaymentRequestSquarePayment).then(value => {
          const isCallable = isFunction(value)

          pushIf(
            this.paymentMethods,
            paymentMethodObject(paymentType.GOOGLE_PAY, 'Google Pay'),
            isCallable,
          )

          isCallable && value()
        }),

        this.verifyApplePaySupport(SquarePayment, SquarePaymentRequestSquarePayment).then(value => {
          const isCallable = isFunction(value)

          pushIf(
            this.paymentMethods,
            paymentMethodObject(paymentType.APPLE_PAY, 'Apple Pay'),
            isCallable,
          )

          isCallable && value()
        }),

        this.verifyCardSupport(SquarePayment).then(value => {
          const isCallable = isFunction(value)

          pushIf(
            this.paymentMethods,
            paymentMethodObject(paymentType.CARD, 'Credit or debit card'),
            isCallable,
          )

          isCallable && value()
        }),
      ])
    },

    /**
     * Verifica se GooglePay está disponível para uso
     */
    async verifyGooglePaySupport (payments: Payments, paymentRequest: PaymentRequest): Promise<false | (() => Promise<boolean>)> {
      try {
        const googlePay = await payments.googlePay(paymentRequest)

        return googlePay.destroy
      } catch (e) {
        return false
      }
    },

    /**
     * Verifica se ApplePay está disponível para uso
     */
    async verifyApplePaySupport (payments: Payments, paymentRequest: PaymentRequest): Promise<false | (() => Promise<boolean>)> {
      try {
        const applePay = await payments.applePay(paymentRequest)

        return applePay.destroy
      } catch (e) {
        return false
      }
    },

    /**
     * Verifica se ApplePay está disponível para uso
     */
    async verifyCardSupport (payments: Payments): Promise<false | (() => Promise<boolean>)> {
      try {
        const cardPay = await payments.card()

        return cardPay.destroy
      } catch (e) {
        return false
      }
    },

    /**
     * Captura os dados que serão necessários no Checkout
     */
    async getData <T extends CheckoutInitialPayload> ({ zipcode }: CheckoutInitialParams): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Houve uma falha ao inicializar o checkout'

      const fetchURL = new URL(`${CHECKOUT_BASE_PATH}/init/checkout/${getCartHandlerPath()}`)

      const cleanedZipCode = numberOnly(trim(zipcode ?? EMPTY_STRING))

      if (zipcode && cleanedZipCode) {
        fetchURL.searchParams.set('zipcode', cleanedZipCode)
      }

      try {
        const response = await fetch(fetchURL, {
          ...buildRequestOptions(),
          priority: 'high',
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
    },

    /**
     * Indica se o campo verificado já foi incluído na lista de elementos visitados
     */
    isVisitedField (fieldName: string): boolean {
      return includes(this.visitedFields, fieldName)
    },

    /**
     * Marca o campo informado na lista de visitados
     */
    setVisitedField (fieldName: string): number {
      return pushIf(
        this.visitedFields,
        fieldName,
        !this.isVisitedField(fieldName),
      )
    },

    /**
     * Dispara as validações de todos os campos após uma tentativa de envio de pagamento
     */
    triggerValidations (): void {
      const {
        notIgnoredFields,
      } = this

      for (const { field } of notIgnoredFields) {
        if (!isInputInstance(field)) continue

        field.dispatchEvent(BLUR_EVENT)
      }
    },

    /**
     * Remove a instância de pagamento via cartão
     */
    async unloadCardInstance (): Promise<void> {
      const {
        squareCardInstance,
      } = this

      if (!squareCardInstance) return

      await squareCardInstance.destroy()

      this.squareCardInstance = NULL_VALUE
    },

    /**
     * Remove a instância de pagamento via Google Pay
     */
    async unloadGooglePayInstance (): Promise<void> {
      const {
        squareGooglePayInstance,
      } = this

      if (!squareGooglePayInstance) return

      await squareGooglePayInstance.destroy()

      this.squareGooglePayInstance = NULL_VALUE
    },

    /**
     * Inicializa e retorna uma instância de pagamento via cartão na Square
     */
    async buildCardInstance (): Promise<Nullable<Card>> {
      const {
        squarePayment,
      } = this

      if (!squarePayment) return NULL_VALUE

      return await squarePayment.card({
        includeInputLabels: false,
        postalCode: this.billingZipCode,
      })
    },

    /**
     * Adiciona o evento responsável por observar modificações no código postal na instância de pagamento via cartão
     */
    watchPostalCodeAtCardPayment (cardPayment?: Card): void {
      if (!cardPayment) return

      cardPayment.addEventListener('postalCodeChanged', e => {
        const postalCodeValue = e.detail?.postalCodeValue ?? NULL_VALUE

        if (!postalCodeValue) return

        this.billingZipCode ??= postalCodeValue
      })
    },

    /**
     * Adiciona o evento responsável por observar modificações nos dados de contato na instância de pagamento via Google Pay
     */
    watchShippingContactChange (paymentRequest?: PaymentRequest): void {
      if (!paymentRequest) return

      paymentRequest.addEventListener('shippingcontactchanged', async (contact: ShippingContact) => {
        if (regexTest(/^USA?$/, contact?.countryCode ?? EMPTY_STRING)) {
          return {}
        }

        const response = {
          error: 'Sorry, we only ship to the USA',
          shippingErrors: {
            country: 'we only ship to the USA',
          },
        } satisfies PaymentRequestUpdate

        return response
      })
    },

    /**
     * Adiciona um observador para a notificação de erros na instância de Cartão da Square
     * Os erros notificados serão registrados no estado da aplicação
     */
    watchSquareCardErrorNotification (cardPayment: Card): void {
      cardPayment.addEventListener('errorClassAdded', e => {
        const {
          field,
        } = e.detail

        pushIf(
          this.squareCardErrorField,
          field,
          !includes(this.squareCardErrorField, field),
        )
      })
    },

    /**
     * Adiciona um observador para a notificação de erros resolvidos na instância de Cartão da Square
     * Os campos que tiveram o problema resolvido serão removidos do estado da aplicação
     * Reverte o processado realizado pelo método `watchSquareCardErrorNotification`
     */
    watchSquareCardSolvedErrorNotification (cardPayment: Card): void {
      cardPayment.addEventListener('errorClassRemoved', e => {
        const {
          field,
        } = e.detail

        if (!includes(this.squareCardErrorField, field)) return

        this.squareCardErrorField = this.squareCardErrorField.filter(_field => _field !== field)
      })
    },

    /**
     * Registra o token indicado para o método indicado
     */
    saveSquareToken (method: PaymentTypes, token: string): void {
      this.squarePaymentToken = {
        token,
        method,
      }
    },

    /**
     * Extrai informações do usuário de um objeto de contato fornecido pela Square
     */
    extractUserInfoFromSquareShippingContact (contact?: ShippingContact): void {
      if (!contact) return

      const {
        email,
        phone,
        givenName,
        familyName,
      } = contact

      this.feedUserFromGooglePay({
        email,
        phone,
        given_name: givenName,
        family_name: familyName,
      })
    },

    /**
     * Permite a realização da limpeza do valor de `deliveryPlace`
     */
    clearDeliveryPlace (): void {
      this.deliveryPlace = NULL_VALUE
    },

    /**
     * Troca o método de pagamento selecionado
     */
    async setSelectedPaymentMethod (paymentMethod: PaymentTypes): Promise<void> {
      const {
        squarePayment,
        selectedPaymentMethod,
      } = this

      if (selectedPaymentMethod === paymentMethod || !squarePayment) return

      this.clearDeliveryPlace()
      this.clearSquarePaymentToken()
      this.clearPreviousPaymentDetails()

      using dispose = disposable(() => {
        setPageLoader({
          loading: false,
        })
      })

      setPageLoader({
        loading: true,
      })

      // Removeremos todas as instâncias de pagamento presentes
      // visto que somente uma poderá ser usada por vez
      await Promise.allSettled([
        this.unloadCardInstance(),
        this.unloadGooglePayInstance(),
      ])

      this.clearCardResume()
      this.clearSquarePaymentToken()
      this.clearPreviousPaymentDetails()

      switch (paymentMethod) {
        case paymentType.GOOGLE_PAY:
        {
          this.deliveryPlace = deliveryType.SAME

          this.selectedPaymentMethod = paymentMethod

          const squarePaymentRequest = squarePayment.paymentRequest(this.squarePaymentRequestOptions)

          this.watchShippingContactChange(squarePaymentRequest)

          this.squareGooglePayInstance = await squarePayment.googlePay(squarePaymentRequest)

          break
        }
        case paymentType.CARD:
        {
          this.selectedPaymentMethod = paymentMethod

          /**
           * Renderiza o iframe no próximo ciclo de atualização
           * Visto que a seção de cartão estará inicialmente escondida
           */
          await nextTick(async () => {
            const cardPayment = await this.buildCardInstance()

            if (!cardPayment) {
              return // TODO implementar mecanismo de proteção
            }

            this.watchPostalCodeAtCardPayment(cardPayment)

            await cardPayment.attach('#cardwrapper')

            this.watchSquareCardErrorNotification(cardPayment)

            this.watchSquareCardSolvedErrorNotification(cardPayment)

            this.squareCardInstance = cardPayment

            scrollIntoView(this.customerNameRef, SCROLL_INTO_VIEW_DEFAULT_ARGS)

            await delay(500)

            focusInput(this.customerNameRef, {
              preventScroll: false,
            })
          })
        }
      }
    },

    /**
     * Alimenta o formulário com dados obtidos dos meios de pagamento
     */
    feedUserFromGooglePay (userFields: FeedableUserFields): void {
      const {
        email       = EMPTY_STRING,
        phone       = EMPTY_STRING,
        family_name = EMPTY_STRING,
        given_name  = EMPTY_STRING,
      } = userFields

      const parsedEmail = trim(email)

      if (parsedEmail) {
        this.customerMail = parsedEmail
      }

      const parsedGivenName = trim(given_name)

      if (parsedGivenName) {
        this.customerGivenName = parsedGivenName
      }

      const parsedFamilyName = trim(family_name)

      if (parsedFamilyName) {
        this.customerFamilyName = parsedFamilyName
      }

      const customerPhone = maskPhoneNumber(numberOnly(phone.replace(/^\+\d+\s/, EMPTY_STRING)))

      if (customerPhone) {
        this.customerPhone = customerPhone
      }
    },

    /**
     * Remove o último token de pagamento retornado pela Square
     */
    clearSquarePaymentToken (): void {
      this.squarePaymentToken = NULL_VALUE
    },

    /**
     * Limpa as informações de pagamento registradas anteriormente
     */
    clearPreviousPaymentDetails (): void {
      this.squareCardResume = NULL_VALUE
    },

    /**
     * captura um resumo do endereço vinculado ao zipcode fornecido
     */
    async resumedAddressFromZip <T extends ResumedAddress[]> (zipcode: string, controller?: AbortController): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Failed to fetch the address'

      try {
        const response = await fetch(`${CHECKOUT_BASE_PATH}/checkout/resumed_address`, {
          ...buildRequestOptions([], HttpMethod.POST),
          priority: 'high',
          keepalive: true,
          signal: controller?.signal,
          body: stringify({
            zipcode,
          })
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
    },

    /**
     * Retorna o token que será usado para pagamento e informações do cartão usado
     */
    buildTokenizedCardResponse (successfulTokenResult: SuccessfulTokenResult): TokenizeCardResponse {
      const {
        token,
        details,
      } = successfulTokenResult

      const card = details?.card

      if (!card) {
        return {
          token,
          cardResume: {
            expMonth: 1,
            expYear: 2026,
            last4: EMPTY_STRING,
            brand: 'MASTERCARD',
          },
        }
      }

      const {
        last4,
        brand,
        expYear,
        expMonth,
      } = card

      return {
        token,
        cardResume: {
          last4,
          brand,
          expYear,
          expMonth,
        },
      }
    },

    /**
     * Registra os dados resumidos do cartão fornecido
     */
    registerCardResume (cardResume: SquareCardResume): void {
      this.squareCardResume = cardResume
    },

    /**
     * Limpa o resumo do cartão fornecido anteriormente
     */
    clearCardResume (): void {
      this.squareCardResume = NULL_VALUE
    },

    /**
     * Tokeniza o cartão de crédito e retorna o token obtido
     */
    async tokenizeCard (cardPayment: Card): Promise<Nullable<TokenizeCardResponse>> {
      const cardTokenized = await cardPayment.tokenize({
        amount: decimalRound(this.getOrderSubtotal / 100, 2).toFixed(2),
        currencyCode: 'USD',
        intent: 'CHARGE',
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: EMPTY_OBJECT,
      })

      if (cardTokenized.status !== 'OK') {
        return NULL_VALUE
      }

      const zipCode = cardTokenized.details?.billing?.postalCode ?? EMPTY_STRING

      if (!zipCode) {
        return this.buildTokenizedCardResponse(cardTokenized)
      }

      const response = await this.resumedAddressFromZip(zipCode)

      if (response.succeeded) {
        const address = response.data.at(0)

        this.billingZipCode = zipCode
        this.billingCity    = address?.city ?? EMPTY_STRING
        this.billingState   = address?.state_abbr ?? EMPTY_STRING
      }

      return this.buildTokenizedCardResponse(cardTokenized)
    },

    /**
     * Registra os dados do cartão, gerando o token antes do fechamento do pedido
     */
    async registerCard (): Promise<void> {
      const {
        isTokenizingCard,
        squareCardInstance,
        squareCardErrorField,
      } = this

      if (!squareCardInstance || isTokenizingCard) return

      using dispose = disposable(() => {
        setPageLoader({
          loading: false,
        })

        this.isTokenizingCard = false
      })

      this.isTokenizingCard = true

      setPageLoader({
        loading: true,
      })

      this.clearCardResume()
      this.clearSquarePaymentToken()

      const response = await this.tokenizeCard(squareCardInstance)

      if (!response) {
        const sortedSquareCardErrorFields = reorderSquareMessagesByPriority(squareCardErrorField)

        await squareCardInstance.focus(sortedSquareCardErrorFields[0])

        return
      }

      this.registerCardResume(response.cardResume)

      this.saveSquareToken(paymentType.CARD, response.token)

      nextTick(async () => {
        scrollIntoView(this.billingAddressSectionRef, {
          ...SCROLL_INTO_VIEW_DEFAULT_ARGS,
          block: 'start',
        })

        await delay(400)

        if (!this.billingZIPValidation.valid) {
          return focusInput(this.billingZipCodeRef, {
            preventScroll: false,
          })
        }

        focusInput(this.billingStreetAddressRef, {
          preventScroll: false,
        })
      })
    },

    /**
     * Remove os dados resumidos de cartão
     * Remove o token de pagamento obtido anteriormente para o cartão
     */
    clearCard (): void {
      this.clearCardResume()
      this.clearSquarePaymentToken()

      const {
        squareCardInstance,
      } = this

      if (!squareCardInstance) return

      nextTick(() => squareCardInstance.focus('cardNumber'))
    },

    /**
     * Tokeniza os dados obtidos na integração com o Google Pay e devolve o token fornecido
     * Além de capturar alguns dados do usuário que autorizou o pagamento para uso no checkout
     */
    async tokenizeGooglePay (googlePay: Nullable<GooglePay>): Promise<Nullable<string>> {
      if (!googlePay) return NULL_VALUE

      const response = await googlePay
        .tokenize()
        .then(response => {
          if (response.status !== 'OK') {
            return NULL_VALUE
          }

          this.extractUserInfoFromSquareShippingContact(response.details?.shipping?.contact)

          return response.token
        })

      return response
    },

    /**
     * Captura o token e  informações adicionais para o meio de pagamento selecionado
     */
    async tokenizer (): Promise<boolean> {
      const {
        selectedPaymentMethod,
      } = this

      switch (selectedPaymentMethod) {
        case paymentType.CARD:
          await this.registerCard()
          break
        case paymentType.GOOGLE_PAY:
        {
          const token = await this.tokenizeGooglePay(this.squareGooglePayInstance)

          if (!token) return false

          this.saveSquareToken(selectedPaymentMethod, token)
        }
      }

      return true
    },

    /**
     * Envia a solicitação de pagamento
     */
    async handleSubmit (e: MouseEvent): Promise<void> {
      preventEvent(e)

      const {
        isSubmitting,
        selectedPaymentMethod,
      } = this

      if (isSubmitting) return

      this.triggerValidations()

      if (!this.submitted) {
        this.submitted = true

        return nextTick(() => this.handleSubmit(e))
      }

      const {
        firstInvalidField,
      } = this

      if (firstInvalidField && firstInvalidField.field) {
        const {
          field,
        } = firstInvalidField

        scrollIntoView(field, SCROLL_INTO_VIEW_DEFAULT_ARGS)

        if (isInputInstance(field)) {
          setTimeout(focusInput, 500, field, {
            preventScroll: false,
          } satisfies FocusOptions)
        }

        return
      }

      using dispose = disposable(() => {
        setPageLoader({
          loading: false,
        })

        this.isSubmitting = false
      })

      const loading = true

      setPageLoader({
        loading,
      })

      this.isSubmitting = loading

      // if (!this.squarePaymentToken) {
      //   const hasDone = await this.tokenizer()
      //
      //   console.assert(hasDone, 'Houve uma falha ao gerar o token para o meio de pagamento selecionado')
      // }
      //
      // switch (selectedPaymentMethod) {
      //   case paymentType.CARD:
      //     console.log('card')
      //     break
      //   case paymentType.GOOGLE_PAY:
      //     console.log(this.paymentPayload)
      // }

      this.orderError = 'Mensagem de erro'
    },

    /**
     * Envia a solicitação de pagamento
     */
    // async postPayment (paymentType: payme): Promise<void> {
    //   const defaultErrorMessage = 'Não foi possível finalizar o seu pedido'
    //
    //   try {
    //     const response = await fetch(`${XANO_BASE_URL}/api:aQp-dj9m/pay/checkout/card/guest`)
    //   } catch (e) {
    //   }
    // },

    /**
     * Realiza a validação e registro do endereço de cobrança
     */
    async validateBillingAddress (): Promise<void> {
      if (!this.isBillingAddressFilled) return

      using dispose = disposable(() => {
        setPageLoader({
          loading: false,
        })
      })

      setPageLoader({
        loading: true,
      })

      this.billingAddressValidationMessage = NULL_VALUE
      this.resumedBillingAddress           = NULL_VALUE

      const shippoPayload = this.shippoBillingAddress

      const response = await this.shippoValidateAddress(shippoPayload)

      if (!response.succeeded) {
        this.billingAddressValidationMessage = EMPTY_STRING

        return
      }

      switch (response.data.status) {
        case 'valid':
          this.clearDeliveryPlace()
          this.billingAddressValidator = response.data.validator
          this.resumedBillingAddress   = buildResumedAddressFromAppState(shippoPayload)

          nextTick(() => {
            scrollIntoView(this.deliveryPlaceSectionRef, SCROLL_INTO_VIEW_DEFAULT_ARGS)
          })
          break
        case 'partially_valid':
          this.billingRecommendedAddress = {
            ...response.data.recommended,
            validator: response.data.validator,
          }
          break
        case 'invalid':
          this.billingAddressValidationMessage = response.data.message
          break
      }
    },

    /**
     * Realiza a validação e registro do endereço de entrega
     */
    async validateShippingAddress (): Promise<void> {
      if (!this.isShippingAddressFilled) return

      using dispose = disposable(() => {
        setPageLoader({
          loading: false,
        })
      })

      setPageLoader({
        loading: true,
      })

      this.shippingAddressValidationMessage = NULL_VALUE
      this.resumedShippingAddress           = NULL_VALUE

      const shippoPayload = this.shippoShippingAddress

      const response = await this.shippoValidateAddress(shippoPayload)

      if (!response.succeeded) {
        this.shippingAddressValidationMessage = EMPTY_STRING

        return
      }

      switch (response.data.status) {
        case 'valid':
          this.shippingAddressValidator = response.data.validator
          this.resumedShippingAddress   = buildResumedAddressFromAppState(shippoPayload)

          nextTick(() => {
            this.handleGetDeliveryOptions()
          })
          break
        case 'partially_valid':
          this.shippingRecommendedAddress = {
            ...response.data.recommended,
            validator: response.data.validator,
          }
          break
        case 'invalid':
          this.shippingAddressValidationMessage = response.data.message
          break
      }
    },

    /**
     * Permite que a sugestão de endereço seja aplicada no endereço de cobrança
     */
    handleApplyRecommendedBillingAddress (): void {
      const {
        billingRecommendedAddress,
      } = this

      if (!billingRecommendedAddress) return

      const {
        validator,
        address_line_1,
        address_line_2,
        postal_code,
        city_locality,
        state_province,
      } = billingRecommendedAddress

      this.billingZipCode            = postal_code
      this.billingStreetAddress      = address_line_1
      this.billingStreetAddressLine2 = address_line_2
      this.billingCity               = city_locality
      this.billingState              = state_province
      this.billingAddressValidator   = validator

      this.resumedBillingAddress = buildResumedAddressFromAppState({
        address_line_1,
        address_line_2,
        postal_code,
        city_locality,
        state_province,
      })

      this.deliveryPlace             = NULL_VALUE
      this.billingRecommendedAddress = NULL_VALUE

      nextTick(async () => {
        await delay(200)

        scrollIntoView(this.deliveryPlaceSectionRef, {
          ...SCROLL_INTO_VIEW_DEFAULT_ARGS,
          block: 'start',
        })
      })
    },

    /**
     * Permite que a sugestão de endereço seja aplicada no endereço de cobrança
     */
    handleApplyRecommendedShippingAddress (): void {
      const {
        shippingRecommendedAddress,
      } = this

      if (!shippingRecommendedAddress) return

      const {
        validator,
        address_line_1,
        address_line_2,
        postal_code,
        city_locality,
        state_province,
      } = shippingRecommendedAddress

      this.shippingZipCode            = postal_code
      this.shippingStreetAddress      = address_line_1
      this.shippingStreetAddressLine2 = address_line_2
      this.shippingCity               = city_locality
      this.shippingState              = state_province
      this.shippingAddressValidator   = validator

      this.resumedShippingAddress = buildResumedAddressFromAppState({
        address_line_1,
        address_line_2,
        postal_code,
        city_locality,
        state_province,
      })

      this.shippingRecommendedAddress = NULL_VALUE

      this.handleGetDeliveryOptions()
    },

    /**
     * Permite a limpeza do endereço de cobrança selecionado previamente
     */
    clearResumedBillingAddress (): void {
      this.resumedBillingAddress = NULL_VALUE
    },

    /**
     * Permite a limpeza do endereço de entrega selecionado previamente
     */
    clearResumedShippingAddress (): void {
      this.resumedShippingAddress = NULL_VALUE
    },

    /**
     * Limpa os dados preenchidos no grupo de endereço de entrega
     */
    clearShippingAddress (): void {
      this.shippingRecipient          = replaceDuplicatedSpaces(this.composedFullName)
      this.shippingZipCode            = EMPTY_STRING
      this.shippingStreetAddress      = EMPTY_STRING
      this.shippingStreetAddressLine2 = EMPTY_STRING
      this.shippingCity               = EMPTY_STRING
      this.shippingState              = EMPTY_STRING

      this.resumedShippingAddress     = NULL_VALUE
      this.shippingRecommendedAddress = NULL_VALUE
    },

    /**
     * Permite a validação de um endereço antes do fechamento do pedido
     */
    async shippoValidateAddress <T extends ShippoValidationResponse> (address: ShippoAddressInput, controller?: AbortController): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Não foi possível validar o endereço fornecido'

      try {
        const response = await fetch(`${XANO_BASE_URL}/api:g39lCezb/address/validate`, {
          ...buildRequestOptions([], HttpMethod.POST),
          signal: controller?.signal,
          body: stringify({
            address,
            include_validation: true,
          }),
        })

        if (!response.ok) {
          const error = await response.json()

          return postErrorResponse.call<
            Response, [string, boolean?, ResponsePatternCallback?], FunctionErrorPattern
          >(response, error?.message ?? defaultErrorMessage)
        }

        const data: T  = await response.json()

        return postSuccessResponse.call<
          Response, [T, ResponsePatternCallback?], FunctionSucceededPattern<T>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },

    /**
     * Permite a seleção de um valor para `deliveryPlace`
     */
    setDeliveryPlace (deliveryPlace: DeliveryTypes): void {
      if (this.deliveryPlace === deliveryPlace) return

      this.deliveryPlace   = deliveryPlace

      this.clearDeliveryOptions()
      this.clearShippingAddress()

      switch (deliveryPlace) {
        case deliveryType.SAME:
          {
            this.handleGetDeliveryOptions()
          }
          break
        case deliveryType.DIFF:
          nextTick(async () => {
            scrollIntoView(this.shippingAddressSectionRef, {
              ...SCROLL_INTO_VIEW_DEFAULT_ARGS,
              block: 'start',
            })

            await delay(300)

            if (!this.shippingRecipientValidation.valid) {
              return focusInput(this.shippingRecipientRef, {
                preventScroll: false,
              })
            }

            focusInput(this.shippingZipCodeRef, {
              preventScroll: false,
            })
          })
      }
    },

    /**
     * Realiza a busca e persistência das opções de entrega no estado da aplicação
     */
    async handleGetDeliveryOptions (): Promise<void> {
      const {
        shippoShippingAddress,
      } = this

      if (!shippoShippingAddress) return

      using dispose = disposable(() => {
        this.isGettingDeliveryOptions = false

        setPageLoader({
          loading: false,
        })
      })

      this.isGettingDeliveryOptions = true

      setPageLoader({
        loading: true,
      })

      const response = await this.getDeliveryOptions(shippoShippingAddress)

      if (!response.succeeded) return

      this.registerDeliveryOptions(response.data)

      await nextTick(async () => {
        await delay(300)

        scrollIntoView(this.deliveryOptionsSectionRef, {
          ...SCROLL_INTO_VIEW_DEFAULT_ARGS,
          block: 'start',
        })
      })
    },

    /**
     * Solicita as opções de entrega para o carrinho atual, usando o endereço de entrega sinalizado
     */
    async getDeliveryOptions <T extends ShippoShipment> (deliveryAddress: IParsedAddress, controller?: AbortController): Promise<ResponsePattern<T>> {
      const defaultErrorMessage = 'Houve uma falha na captura das opções de entrega'

      const cartPath = getCartHandlerPath()

      try {
        const response = await fetch(`${XANO_BASE_URL}/api:aQp-dj9m/delivery/checkout/${cartPath}`, {
          ...buildRequestOptions([], HttpMethod.POST),
          signal: controller?.signal,
          body: stringify({
            delivery_address: deliveryAddress,
            recipient_full_name: normalizeText(trim(this.shippingRecipient)),
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
          Response, [T], FunctionSucceededPattern<T>
        >(response, data)
      } catch (e) {
        return postErrorResponse(defaultErrorMessage)
      }
    },

    /**
     * Registra as opções de entrega após finalizar a busca na API
     */
    registerDeliveryOptions (deliveryOptions: ShippoShipment): void {
      this.deliveryOptions = deliveryOptions
    },

    /**
     * Realiza a limpeza dos dados de entrega no estado da aplicação
     */
    clearDeliveryOptions (): void {
      this.deliveryOption  = NULL_VALUE
      this.deliveryOptions = NULL_VALUE
    },

    /**
     * Permite a seleção de uma opção de entrega
     */
    setDeliveryOption (objectId: string): void {
      const {
        deliveryOptionsIds,
      } = this

      if (!includes(deliveryOptionsIds, objectId)) return

      this.deliveryOption = objectId

      nextTick(async () => {
        await delay(200)

        scrollIntoView(this.orderResumeSectionRef, {
          ...SCROLL_INTO_VIEW_DEFAULT_ARGS,
          block: 'start',
        })
      })
    },
  },

  computed: {
    /**
     * Retorna o subtotal do pedido
     */
    getOrderSubtotal (): number {
      const {
        cart,
      } = this

      return cart?.order_price ?? 0
    },

    /**
     * Retorna o valor de `getOrderSubtotal` formatado em USD
     */
    getOrderSubtotalFormatted (): string {
      return USDFormatter.format(decimalRound(this.getOrderSubtotal / 100, 2))
    },

    /**
     * Retorna o valor da opção de entrega selecionada
     */
    getDeliveryPrice (): number {
      const {
        getSelectedDeliveryRate,
      } = this

      return getSelectedDeliveryRate?.amount ?? 0
    },

    /**
     * Retorna o valor de `getDeliveryPrice` formatado em USD
     */
    getDeliveryPriceFormatted (): string {
      return USDFormatter.format(
        decimalRound(this.getDeliveryPrice / 100, 2)
      )
    },

    /**
     * Retorna o valor total do pedido, considerando subtotal, frete e possíveis descontos
     */
    getOrderPrice (): number {
      const prices = [
        this.getOrderSubtotal,
        this.getDeliveryPrice,
      ]

      return prices.reduce<number>(
        (sum, price) => sum + price,
        0,
      )
    },

    /**
     * Retorna o valor de `getOrderPrice` formatado em USD
     */
    getOrderPriceFormatted (): string {
      return USDFormatter.format(
        decimalRound(
          this.getOrderPrice / 100,
          2,
        )
      )
    },

    /**
     * Indica se existe um meio de pagamento selecionado
     */
    hasSelectedPaymentMethod (): boolean {
      return this.selectedPaymentMethod !== NULL_VALUE
    },

    /**
     * Indica se o método de pagamento selecionado é cartão
     */
    isCardPayment (): boolean {
      return this.selectedPaymentMethod === paymentType.CARD
    },

    /**
     * Captura a lista de produtos parseada para impressão
     */
    getParsedProducts (): RenderableProduct[] {
      const {
        cart,
      } = this

      if (!cart) return []

      return cart.items.map(({ price, name, webflow_id, quantity }) => {
        const decimalPrice = decimalRound(price / 100, 2)

        return ({
          name,
          quantity,
          webflow_id,
          price: USDFormatter.format(decimalPrice),
          finalPrice: USDFormatter.format(decimalPrice * quantity),
        })
      })
    },

    /**
     * Retorna as opções de entrega no formato esperado pela Square
     */
    squareParsedDeliveryOptions (): ShippingOption[] {
      const {
        deliveryOptions,
      } = this

      if (!deliveryOptions) return []

      return deliveryOptions.rates.map<ShippingOption>(({ object_id, display_name, estimated_days, amount }) => ({
        id: object_id,
        label: join([
          estimated_days,
          pluralize(estimated_days, 'day', 'days'),
          DASH_STRING,
          display_name,
        ], SPACE_STRING),
        amount: decimalRound(amount / 100, 2).toFixed(2),
      }))
    },

    /**
     * Retorna a lista de produtos no formato esperado pela Square
     */
    squareParsedCartItems (): LineItem[] {
      const {
        cart,
      } = this

      if (!cart) return []

      const productURLBase = join(
        [
          location.protocol,
          EMPTY_STRING,
          location.hostname,
          'product-catalog',
        ],
        SLASH_STRING,
      )

      return cart.items.map<LineItem>(({ quantity, webflow_id, price, name, sku_id }) => ({
        id: webflow_id,
        label: `${quantity}x ${name}`,
        productUrl: join([productURLBase, sku_id], SLASH_STRING),
        amount: decimalRound(price / 100, 2).toFixed(2),
      }))
    },

    /**
     * Retorna os dados que serão usados na construção da instância de pagamento da Square
     */
    squarePaymentRequestOptions (): PaymentRequestOptions {
      const {
        getOrderSubtotal,
      } = this

      return {
        countryCode: 'US',
        currencyCode: 'USD',
        total: {
          amount: decimalRound(getOrderSubtotal / 100, 2).toFixed(2),
          label: 'Cementina Order',
        },
        requestBillingContact: true,
        requestShippingContact: true,
        lineItems: this.squareParsedCartItems,
        shippingOptions: this.squareParsedDeliveryOptions,
      }
    },

    /**
     * Indica se os dados da seção "Dados pessoais" são todos válidos após uma tentativa de submissão
     */
    isPersonalDataValid (): boolean {
      const {
        submitted,
        customerMailValidation,
        customerPhoneValidation,
      } = this

      return !submitted || [
        customerMailValidation,
        customerPhoneValidation,
      ].every(Boolean)
    },

    /**
     * Retorna a composição do nome completo do usuário baseando-se em `customerGivenName` e `customerFamilyName`
     */
    composedFullName (): string {
      const {
        customerGivenName,
        customerFamilyName,
      } = this

      return join(
        [customerGivenName, customerFamilyName].filter(Boolean),
        SPACE_STRING,
      )
    },

    /**
     * Realiza e retorna a validação para a seleção de métodos de pagamento
     */
    paymentMethodValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.paymentMethodMessageRef,
        this.hasSelectedPaymentMethod,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Given name"
     */
    customerNameValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerNameRef,
        !this.isVisitedField('customerName') || regexTest(PARTIAL_NAME_REGEX_VALIDATION, this.customerGivenName),
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Family name"
     */
    customerFamilyNameValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerFamilyNameRef,
        !this.isVisitedField('customerFamilyName') || regexTest(PARTIAL_NAME_REGEX_VALIDATION, this.customerFamilyName),
      )
    },

    /**
     * Retorna validação para o campo "E-mail'
     */
    customerMailValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerMailRef,
        !this.isVisitedField('customerMail') || regexTest(EMAIL_REGEX_VALIDATION, this.customerMail),
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Telefone"
     */
    customerPhoneValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.customerPhoneRef,
        !this.isVisitedField('customerPhone') || regexTest(PHONE_REGEX_VALIDATION, this.customerPhone),
      )
    },

    /**
     * Realiza e retorna a validação para a instância de cartão da Square
     */
    squareCardValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.squareCardWrapperRef,
        !isNull(this.squareCardResume) && !this.hasCardErrorMessage,
        !this.isCardPayment,
      )
    },

    /**
     * Dados que serão usados no fechamento do pedido
     */
    paymentPayload (): PaymentPayload {
      const {
        customerGivenName,
        customerFamilyName,
        customerMail,
        customerPhone,
        squarePaymentToken,
        deliveryPlace,
        deliveryOption,
        billingAddressValidator,
        shippingAddressValidator,
      } = this

      if (!squarePaymentToken) {
        return outcomingDataError('Não foi possível verificar as informações de pagamento')
      }

      if (!isDeliveryPlaceValid(deliveryPlace)) {
        return outcomingDataError('Não foi possível identificar a opção de entrega')
      }

      if (!deliveryOption) {
        return outcomingDataError('Nenhuma opção de entrega selecionada')
      }

      const addressSet = buildAddressesSet({
        _deliveryType: deliveryPlace,
        billingAddress: this.shippoBillingAddress,
        shippingAddress: this.shippoShippingAddress,
        billingValidator: billingAddressValidator,
        shippingValidator: shippingAddressValidator,
      })

      if (!addressSet) {
        return outcomingDataError('A verificação de endereços falhou')
      }

      return outcomingDataSuccess({
        ...addressSet,
        source_id: squarePaymentToken.token,
        customer: {
          given_name: customerGivenName,
          family_name: customerFamilyName,
          email: customerMail,
          phone: join(
            [
              '+1',
              SPACE_STRING,
              maskPhoneNumber(numberOnly(customerPhone)),
            ],
            EMPTY_STRING,
          ),
        },
        delivery_option: deliveryOption,
      })
    },

    /**
     * Retorna o endereço de cobrança no formato da API Shippo
     */
    shippoBillingAddress (): ShippoAddress {
      const {
        billingCity,
        billingState,
        billingZipCode,
        billingStreetAddress,
        billingStreetAddressLine2,
      } = this

      return {
        address_line_1: billingStreetAddress,
        address_line_2: billingStreetAddressLine2,
        city_locality: billingCity,
        state_province: billingState,
        postal_code: billingZipCode,
        country_code: 'US',
      }
    },

    /**
     * Retorna o endereço de entrega no formato da API Shippo
     */
    shippoShippingAddress (): ShippoAddress {
      if (this.isCardPayment && this.deliveryPlace === deliveryType.SAME) {
        return this.shippoBillingAddress
      }

      const {
        shippingCity,
        shippingState,
        shippingZipCode,
        shippingStreetAddress,
        shippingStreetAddressLine2,
      } = this

      return {
        address_line_1: shippingStreetAddress,
        address_line_2: shippingStreetAddressLine2,
        city_locality: shippingCity,
        state_province: shippingState,
        postal_code: shippingZipCode,
        country_code: 'US',
      }
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o CEP" no endereço de cobrança
     */
    billingZIPValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingZipCodeRef,
        !this.isVisitedField('billingZipCode') || regexTest(ZIP_CODE_REGEX_VALIDATION, this.billingZipCode),
        !this.isCardPayment,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o endereço" no endereço de cobrança
     */
    billingStreetAddressValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingStreetAddressRef,
        !this.isVisitedField('billingStreetAddress') || objectSize(this.billingStreetAddress) > 2,
        !this.isCardPayment,
      )
    },

    /**
     * Realiza e retorna a validação para a cidade do endereço de cobrança
     */
    billingCityValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingCityRef,
        !this.isVisitedField('billingCity') || objectSize(this.billingCity) > 2,
        !this.isCardPayment,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o estado" do endereço de cobrança
     */
    billingStateValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingStateRef,
        !this.isVisitedField('billingState') || includes(statesAcronym, this.billingState),
        !this.isCardPayment,
      )
    },

    /**
     * Verifica se o grupo de informações do endereço de cobrança está inteiramente válido
     */
    billingAddressGroupValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.billingAddressSectionRef,
        this.resumedBillingAddress !== NULL_VALUE,
        !this.isCardPayment,
      )
    },

    /**
     * Indica se todos os campos do endereço de cobrança foram preenchidos corretamente
     */
    isBillingAddressFilled (): boolean {
      return [
        buildAddressFieldValidator(
          this.billingZipCode,
          this.billingZIPValidation,
        ),
        buildAddressFieldValidator(
          this.billingStreetAddress,
          this.billingStreetAddressValidation,
        ),
        buildAddressFieldValidator(
          this.billingCity,
          this.billingCityValidation,
        ),
        buildAddressFieldValidator(
          this.billingState,
          this.billingStateValidation,
        ),
      ].every(({ value, validator }) => {
        return value !== EMPTY_STRING && validator.valid
      })
    },

    /**
     * Realiza e retorna a validação para a seleção de `deliveryPlace`
     */
    deliveryPlaceValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.deliveryPlaceMessageRef,
        this.hasDeliveryPlace,
        !this.isCardPayment,
      )
    },

    /**
     * Realiza e retorna a validação sobre o campo "Recipient" no endereço de entrega
     */
    shippingRecipientValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingRecipientRef,
        !this.isVisitedField('shippingRecipient') || regexTest(FULLNAME_REGEX_VALIDATION, normalizeText(trim(this.shippingRecipient))),
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Add your ZIP code" do endereço de entrega
     */
    shippingZipCodeValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingZipCodeRef,
        !this.isVisitedField('shippingZipCode') || regexTest(ZIP_CODE_REGEX_VALIDATION, this.shippingZipCode),
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Adicione o endereço" do endereço de entrega
     */
    shippingStreetAddressValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingStreetAddressRef,
        !this.isVisitedField('shippingStreetAddress') || objectSize(this.shippingStreetAddress) > 2,
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Add your city" do endereço de entrega
     */
    shippingCityValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingCityRef,
        !this.isVisitedField('shippingCity') || objectSize(this.shippingCity) > 2,
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Realiza e retorna a validação para o campo "Add your state" do endereço de entrega
     */
    shippingStateValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingStateRef,
        !this.isVisitedField('shippingState') || includes(statesAcronym, this.shippingState),
        !this.shouldValidateShippingAddress,
      )
    },

    /**
     * Verifica se o grupo de informações do endereço de entrega está inteiramente válido
     */
    shippingAddressGroupValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.shippingAddressSectionRef,
        this.resumedShippingAddress !== NULL_VALUE,
        this.isCardPayment && !this.isDiffAddress,
      )
    },

    /**
     * Realiza e retorna a valicação para a opção de entrega
     */
    deliveryOptionValidation (): ISingleValidateCheckout {
      return buildFieldValidation(
        this.deliveryOptionsSectionRef,
        !isNull(this.deliveryOptions) && !isNull(this.deliveryOption),
        this.isDiffAddress && !this.isShippingAddressFilled,
      )
    },

    /**
     * Indica se todos os campos do endereço de entrega foram preenchidos corretamente
     */
    isShippingAddressFilled (): boolean {
      return [
        buildAddressFieldValidator(
          this.shippingZipCode,
          this.shippingZipCodeValidation,
        ),
        buildAddressFieldValidator(
          this.shippingStreetAddress,
          this.shippingStreetAddressValidation,
        ),
        buildAddressFieldValidator(
          this.shippingCity,
          this.shippingCityValidation,
        ),
        buildAddressFieldValidator(
          this.shippingState,
          this.shippingStateValidation,
        ),
      ].every(({ value, validator }) => {
        return value !== EMPTY_STRING && validator.valid
      })
    },

    /**
     * Indica se o endereço de entrega deve ser validado
     */
    shouldValidateShippingAddress (): boolean {
      return this.isCardPayment
        ? this.hasDeliveryPlace && this.isDiffAddress
        : true
    },

    /**
     * Retorna os itens que necessitem de validação e não estão sendo ignorados
     */
    notIgnoredFields (): ISingleValidateCheckout[] {
      return [
        this.paymentMethodValidation,
        this.customerNameValidation,
        this.customerFamilyNameValidation,
        this.customerMailValidation,
        this.customerPhoneValidation,
        this.squareCardValidation,
        this.billingZIPValidation,
        this.billingStreetAddressValidation,
        this.billingCityValidation,
        this.billingStateValidation,
        this.billingAddressGroupValidation,
        this.deliveryPlaceValidation,
        this.shippingRecipientValidation,
        this.shippingZipCodeValidation,
        this.shippingStreetAddressValidation,
        this.shippingCityValidation,
        this.shippingStateValidation,
        this.shippingAddressGroupValidation,
        this.deliveryOptionValidation,
      ].filter(({ ignoreIf }) => !ignoreIf)
    },

    /**
     * Retorna o primeiro elemento de `notIgnoredFields` que seja inválido
     */
    firstInvalidField (): Nullable<ISingleValidateCheckout> {
      return this.notIgnoredFields.find(({ valid }) => !valid) ?? NULL_VALUE
    },

    /**
     * Indica se existe falha em algum dos campos do iframe de cartão de crédito
     */
    hasCardErrorMessage (): boolean {
      return objectSize(this.squareCardErrorField) > 0
    },

    /**
     * Retorna a mensagem de acordo com a ordem de prioridade para o grupo de campos de cartão
     */
    cardErrorMessage (): Nullable<string> {
      const {
        squareCardErrorField,
      } = this

      if (objectSize(squareCardErrorField) < 1) {
        return NULL_VALUE
      }

      const sortedSquareCardErrorField = reorderSquareMessagesByPriority(squareCardErrorField)

      return squareCardErrorMessages[sortedSquareCardErrorField[0]].message
    },

    /**
     * Retorna as informações resumidas do cartão para exibição no checkout
     */
    cardResume (): Nullable<string> {
      const {
        squareCardResume,
      } = this

      if (!squareCardResume) return NULL_VALUE

      const {
        brand,
        last4,
        expYear,
        expMonth,
      } = squareCardResume

      return join([
        brand,
        join([
          expMonth.toString().padStart(2, '0'),
          expYear,
        ], SLASH_STRING),
        `**** ${last4}`,
      ], SPACE_STRING)
    },

    /**
     * Indica se uma opção foi selecionada para `deliveryPlace`
     */
    hasDeliveryPlace (): boolean {
      return this.deliveryPlace !== NULL_VALUE
    },

    /**
     * Indica se foram selecionados endereços de cobrança e entrega diferentes
     */
    isDiffAddress (): boolean {
      return this.deliveryPlace === deliveryType.DIFF
    },

    /**
     * Indica se as opções de entrega deverão ser exibidas
     */
    showDeliveryOptions (): boolean {
      const {
        deliveryPlace,
        deliveryOptions,
        selectedPaymentMethod,
        isBillingAddressFilled,
        isShippingAddressFilled,
      } = this

      if (!selectedPaymentMethod || !deliveryOptions) return false

      return (deliveryPlace === deliveryType.DIFF && isShippingAddressFilled) || isBillingAddressFilled
    },

    /**
     * Retorna as opções de entrega tratadas para exibição
     */
    getParsedDeliveryOptions (): ParsedShippoRate[] {
      const {
        deliveryOptions,
      } = this

      if (!deliveryOptions) return []

      return deliveryOptions.rates.map<ParsedShippoRate>(({ amount, display_name, estimated_days, object_id, attributes }) => ({
        object_id,
        display_name,
        attributes,
        estimated_days: join([
          estimated_days,
          pluralize(estimated_days, 'day', 'days'),
        ], SPACE_STRING),
        amount: USDFormatter.format(decimalRound(amount / 100, 2)),
      }))
    },

    /**
     * Retorna a lista de ObjectIds presentes na lista de entrega
     */
    deliveryOptionsIds (): string[] {
      const {
        getParsedDeliveryOptions,
      } = this

      return getParsedDeliveryOptions.map<string>(({ object_id }) => object_id)
    },

    /**
     * Retorna um resumo da opção de entrega selecionada
     */
    getSelectedDeliveryRate (): Nullable<Pick<ShippoRate, 'amount' | 'estimated_days'>> {
      const {
        deliveryOption,
        deliveryOptions,
      } = this

      if (!deliveryOptions || !deliveryOption) return NULL_VALUE

      const rate = deliveryOptions.rates.find(({ object_id }) => object_id === deliveryOption)

      if (!rate) return NULL_VALUE

      const {
        amount,
        estimated_days,
      } = rate

      return {
        amount,
        estimated_days,
      }
    },

    /**
     * Indica se existe uma opção de entrega selecionada
     */
    hasDeliveryOptionSelected (): boolean {
      return this.getSelectedDeliveryRate !== NULL_VALUE
    },
  },

  watch: {
    async billingZipCode (zipCode: string, oldZipCode: string, cleanup: OnCleanup): Promise<void> {
      const moreThanFourChars = objectSize(zipCode) > 4

      if (moreThanFourChars) {
        this.squareCardInstance?.configure({
          postalCode: zipCode,
        })
      }

      if (!moreThanFourChars) return

      const controller = new AbortController()

      cleanup(() => controller.abort())

      const addresses = await this.resumedAddressFromZip(zipCode, controller)

      if (!addresses.succeeded) return

      const address = addresses.data.at(0)

      if (!address) return

      this.billingCity  = address.city
      this.billingState = toUpperCase(address.state_abbr)
    },

    async shippingZipCode (zipCode: string, oldZipCode: string, cleanup: OnCleanup): Promise<void> {
      const moreThanFourChars = objectSize(zipCode) > 4

      if (!moreThanFourChars) return

      const controller = new AbortController()

      cleanup(() => controller.abort())

      const addresses = await this.resumedAddressFromZip(zipCode, controller)

      if (!addresses.succeeded) return

      const address = addresses.data.at(0)

      if (!address) return

      this.shippingCity  = address.city
      this.shippingState = toUpperCase(address.state_abbr)
    },

    /**
     * Observa a seção que exibe a mensagem de erro global
     * Sempre que ela aparecer, ocorrerá um scroll automático até ela
     */
    orderErrorSectionRef (element: Nullable<HTMLDivElement>): void {
      if (!element) return

      nextTick(async () => {
        await delay(200)

        scrollIntoView(element, SCROLL_INTO_VIEW_DEFAULT_ARGS)
      })
    },
  },

  directives: {
    /**
     * Pode ser usada com o atributo "v-trim"
     * Remove espaços antes e depois do conteúdo de um campo de texto
     */
    trim: buildMaskDirective(trim),

    /**
     * Pode ser usado com o atributo "v-zip-code"
     * Realiza a aplicação de uma máscara para a o formato de ZIPCODE americano (00000-????)
     */
    zipCode: buildMaskDirective(numberOnly, maskZipCode),

    /**
     * Pode ser usada com o atributo "v-numbers-only"
     * Remove qualquer caractere não númerico do conteúdo do campo que recebeu o atributo
     */
    numbersOnly: buildMaskDirective(numberOnly),

    /**
     * Pode ser usada com o atributo "v-uppercase"
     * Realiza a transformação dos caracteres inseridos no campo que recebeu o atributo para maiúsculas
     */
    uppercase: buildMaskDirective(toUpperCase),

    /**
     * Pode ser usada com o atributo "v-normalize"
     * Realiza a limpeza dos dados incluídos no campo que recebeu o atributo
     */
    normalize: buildMaskDirective(normalizeText),

    /**
     * Pode ser usado com o atributo "v-remove-duplicated-spaces"
     * Realiza a remoção de espaços duplicados no campo que recebeu o atributo
     */
    removeDuplicatedSpaces: buildMaskDirective(replaceDuplicatedSpaces),

    /**
     * Pode ser usada com o atributo "v-mask-date"
     * Realiza a aplicação de uma máscara de data ao campo que recebe o atributo
     */
    maskDate: buildMaskDirective(numberOnly, maskDate),

    /**
     * Pode ser usada com o atributo "v-mask-phone"
     * Realiza a aplicação de uma máscara para a numeração inserida no campo que recebe o atributo
     */
    maskPhone: buildMaskDirective(numberOnly, maskPhoneNumber),

    /**
     * Pode ser usada com o atributo "v-visited-field"
     * Realiza a inclusão do campo do nome indicado na lista de elementos visitados
     */
    visitedField: {
      mounted (el: HTMLInputElement, { value, instance }: DirectiveBinding<string>) {
        const remover = attachEvent(el, 'blur', () => {
          // TODO: Encontrar maneira de tipar corretamente a instância do componente abaixo
          // @ts-ignore
          instance.setVisitedField(value)

          eventMap.delete(el)
        }, { once: true })

        eventMap.set(el, remover)
      },

      unmounted: cleanupDirective,
    },
  },
})

createApp(CheckoutComponent).mount('#fechamentodopedido')

window.addEventListener('pageshow', ({ persisted }) => {
  if (persisted) location.reload()
})
