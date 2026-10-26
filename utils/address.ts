
import {
  type ISingleValidateCheckout,
} from '../types/checkout'

import {
  type ShippoAddressInput,
} from '../types/address'

import {
  join,
  replaceDuplicatedSpaces,
} from './dom'

import {
  deliveryType,
  type DeliveryTypes,
} from '../types/delivery'

import {
  type CheckoutAddresses,
} from '../types/checkout.definition'

import {
  NULL_VALUE,
} from './consts'

import {
  type Nullable,
} from '../types/global'

export const statesAcronym = [
  "AL", // Alabama
  "AK", // Alasca
  "AZ", // Arizona
  "AR", // Arkansas
  "CA", // Califórnia
  "NC", // Carolina do Norte
  "SC", // Carolina do Sul
  "CO", // Colorado
  "CT", // Connecticut
  "ND", // Dakota do Norte
  "SD", // Dakota do Sul
  "DE", // Delaware
  "DC", // Distrito de Colúmbia
  "FL", // Flórida
  "AA", // Forças Armadas América
  "AE", // Forças Armadas Europa
  "AP", // Forças Armadas Pacífico
  "GA", // Geórgia
  "GU", // Guam
  "HI", // Havaí
  "ID", // Idaho
  "MP", // Ilhas Marianas do Norte
  "VI", // Ilhas Virgens Americanas
  "IL", // Illinois
  "IN", // Indiana
  "IA", // Iowa
  "KS", // Kansas
  "KY", // Kentucky
  "LA", // Louisiana
  "ME", // Maine
  "MD", // Maryland
  "MA", // Massachusetts
  "MI", // Michigan
  "MN", // Minnesota
  "MS", // Mississippi
  "MO", // Missouri
  "MT", // Montana
  "NE", // Nebraska
  "NV", // Nevada
  "NH", // Nova Hampshire
  "NJ", // Nova Jersey
  "NY", // Nova York
  "NM", // Novo México
  "OH", // Ohio
  "OK", // Oklahoma
  "OR", // Oregon
  "PA", // Pensilvânia
  "PR", // Porto Rico
  "RI", // Rhode Island
  "AS", // Samoa Americana
  "TN", // Tennessee
  "TX", // Texas
  "UT", // Utah
  "VT", // Vermont
  "VA", // Virgínia
  "WV", // Virgínia Ocidental
  "WA", // Washington
  "WI", // Wisconsin
  "WY", // Wyoming
]

export interface AddressValidatorField {
  /**
   * Valor preenchido no form
   */
  value: string;
  /**
   * Grupo de validação do campo
   */
  validator: ISingleValidateCheckout;
}

export function buildAddressFieldValidator (value: string, validator: ISingleValidateCheckout): AddressValidatorField {
  return {
    value,
    validator,
  }
}

export function buildResumedAddressFromAppState ({ address_line_1, address_line_2, state_province, country_code, postal_code, city_locality }: ShippoAddressInput): string {
  return replaceDuplicatedSpaces(
    join(
      [
        join([address_line_1, address_line_2], ' '),
        join([city_locality, state_province, postal_code], ' '),
        country_code,
      ],
      '; ',
    )
  )
}

export interface BuildAddressesSetParams {
  _deliveryType: DeliveryTypes;
  billingValidator: Nullable<string>;
  billingAddress: ShippoAddressInput;
  shippingValidator: Nullable<string>;
  shippingAddress: ShippoAddressInput;
}

export function buildAddressesSet ({
  _deliveryType,
  billingAddress,
  shippingAddress,
  billingValidator,
  shippingValidator,
}: BuildAddressesSetParams): Nullable<CheckoutAddresses> {
  switch (_deliveryType) {
    case deliveryType.SAME:
    {
      if (!billingValidator) return NULL_VALUE

      return ({
        delivery_place: _deliveryType,
        billing_address: {
          ...billingAddress,
          validator: billingValidator,
        },
      })
    }
    case deliveryType.DIFF:
    {
      if (!billingValidator || !shippingValidator) return NULL_VALUE

      return ({
        delivery_place: _deliveryType,
        billing_address: {
          ...billingAddress,
          validator: billingValidator,
        },
        shipping_address: {
          ...shippingAddress,
          validator: shippingValidator,
        },
      })
    }
  }

  return NULL_VALUE
}
