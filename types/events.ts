
import {
  type CartResume,
} from './floating-cart'

export interface CementinaCartToggleDetail {
  /**
   * Indica se é necessária uma nova busca pelos dados atualizados antes da exibição do carrinho
   */
  refreshRequired?: boolean;

  /**
   * Força um estado ao carrinho
   */
  isOpened?: boolean;
}

export interface CementinaCartItemsChangeDetail extends CartResume {
}


