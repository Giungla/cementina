
import {
  type Nullable,
} from './global'

export interface ISingleValidateCheckout <T extends Nullable<HTMLElement> = Nullable<HTMLElement>> {
  /**
   * Referência ao campo
   */
  field: T;
  /**
   * Indica se o `value` contido no campo é válido
   */
  valid: boolean;
  /**
   * Indica se o campo será ignorado para validação
   */
  ignoreIf?: boolean;
}
