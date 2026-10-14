
import {
  type DeliveryPlace,
  type DeliveryTypes,
} from '../types/delivery'

export function deliveryPlaceObject (token: DeliveryTypes, label: string): DeliveryPlace {
  return {
    token,
    label,
  }
}
