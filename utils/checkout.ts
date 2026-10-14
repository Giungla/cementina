
import {
  NULL_VALUE,
} from './consts'

import {
  type FinalCheckoutPay,
} from '../types/checkout.definition'

import {
  type DeliveryTypes,
  deliveryType,
} from '../types/delivery'

import {
  includes,
} from './array'

import {
  type PaymentTypes,
} from './payment'

export const CHECKOUT_ENDPOINTS = {
  creditdebitcard: 'card',
  googlepay: 'googlepay',
  applepay: 'applepay',
}

export function validateOutcomingData <T extends unknown> (value: unknown): value is T {
  return value !== NULL_VALUE
}

export function outcomingDataError (message: string) {
  return {
    failed: true,
    message: message,
  }
}

export function outcomingDataSuccess (payload: FinalCheckoutPay) {
  return {
    payload,
    failed: false,
  }
}

export type PaymentPayload = ReturnType<typeof outcomingDataError> | ReturnType<typeof outcomingDataSuccess>

export function isDeliveryPlaceValid (deliveryPlace: any): deliveryPlace is DeliveryTypes {
  return includes([deliveryType.DIFF, deliveryType.SAME], deliveryPlace)
}

export function paymentTypeEndpoint (paymentType: PaymentTypes) {

}
