
import {
  type PaymentTypes,
} from './payment'

import {
  type CardDetails,
  type CardFieldNames,
} from '@square/web-sdk'

export interface SquareCardErrorMessage {
  /**
   * Ordem de prioridade de exibição da mensagem
   */
  priority: number;
  /**
   * Mensagem de erro padrão do campo
   */
  message: string;
}

export const squareCardErrorMessages: Record<CardFieldNames, SquareCardErrorMessage> = {
  cvv: buildSquareCardErrorMessage(
    3,
    'Enter a valid security code',
  ),
  postalCode: buildSquareCardErrorMessage(
    4,
    'Enter a valid ZIP code',
  ),
  cardNumber: buildSquareCardErrorMessage(
    1,
    'Enter a valid card number',
  ),
  expirationDate: buildSquareCardErrorMessage(
    2,
    'Enter a valid expiration date',
  ),
}

export interface SquarePaymentToken {
  /**
   * Identifica por qual meio de pagamento o token foi gerado
   */
  method: PaymentTypes;
  /**
   * Conteúdo do token
   */
  token: string;
}

export interface SquareCardResume extends Pick<CardDetails, 'last4' | 'expMonth' | 'expYear'> {
  brand: string;
}

export function reorderSquareMessagesByPriority (fields: CardFieldNames[]): CardFieldNames[] {
  return fields.toSorted((a, b) => squareCardErrorMessages[a].priority - squareCardErrorMessages[b].priority)
}

export function buildSquareCardErrorMessage (priority: number, message: string): SquareCardErrorMessage {
  return {
    message,
    priority,
  }
}
