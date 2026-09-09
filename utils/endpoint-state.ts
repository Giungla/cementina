
import {
  getCookie,
} from './cookie'

import {
  AUTH_COOKIE_NAME,
} from './requestResponse'

export const handleCartTypes = ({
  USER: 'user',
  GUEST: 'guest',
}) as const

export type HandleCartType = typeof handleCartTypes

export type HandleCartTypes = HandleCartType[keyof HandleCartType]

export function getCartHandlerPath (): HandleCartTypes {
  return getCookie(AUTH_COOKIE_NAME) !== false
    ? handleCartTypes.USER
    : handleCartTypes.GUEST
}
