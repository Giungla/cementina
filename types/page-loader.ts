
import {
  querySelector,
} from '../utils/dom'

export interface PageLoader {
  /**
   * Indica se a tela de carregamento será exibida
   */
  loading?: boolean;
}

export const loaderElement = querySelector<'div'>('[data-wtf-loader]')
