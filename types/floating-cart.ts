
import {
  type Nullable,
} from './global'

import {
  type CartHandleResponse,
} from './cart'

export interface FloatingCartState {
  /**
   * Indica se já houve uma busca pelos dados do carrinho
   */
  fetched: Nullable<boolean>;
  /**
   * Indica se existe uma busca em andamento pelos itens do carrinho
   */
  isPending: boolean;
  /**
   * Indica o estado de visibilidade do carrinho
   */
  isCartOpened: boolean;
  /**
   * Dados devolvidos pela API
   */
  cart: Nullable<CartHandleResponse>;
  /**
   * Valor do frete para os produtos no carrinho
   */
  shippingPrice: Nullable<number>;
}

export interface FloatingCartStateHandler {
  /**
   * Valor total do preço de venda dos produtos formatados em USD
   */
  getOrderPrice: string;
  /**
   * Valor total do preço de capa dos produtos formatados em USD
   */
  getFullOrderPrice: string;
}

export type GroupFloatingCartState = FloatingCartState & FloatingCartStateHandler;

export interface CartResume {
  /**
   * Quantidade de itens inclusos no carrinho
   */
  cart_items: number;
}
