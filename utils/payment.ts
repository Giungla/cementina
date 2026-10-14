
export const paymentType = ({
  /**
   * Representa o pagamento via GooglePay
   */
  GOOGLE_PAY: 'googlepay',
  /**
   * Representa o pagamento por boleto
   */
  APPLE_PAY: 'applepay',
  /**
   * Representa o pagamento por cartão de crédito ou débito
   */
  CARD: 'creditdebitcard',
}) as const

export const ALLOWED_PAYMENT_METHODS = ([
  paymentType.GOOGLE_PAY,
  paymentType.APPLE_PAY,
  paymentType.CARD,
]) as const

export type PaymentType = typeof paymentType

export type PaymentTypes = PaymentType[keyof typeof paymentType]


