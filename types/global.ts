
import {
  type CementinaCartToggleDetail,
  type CementinaCartItemsChangeDetail,
} from './events'

import {
  type PageLoader,
} from './page-loader'

declare global {
  interface GlobalEventHandlersEventMap {
    /**
     * Disparado quando o carrinho flutuante for aberto ou fechado
     */
    'cementina-cart-toggle': CustomEvent<CementinaCartToggleDetail>;

    /**
     * Disparado quando a quantidade de elementos no carrinho flutuante mudar
     */
    'cementina-cart-items-change': CustomEvent<CementinaCartItemsChangeDetail>;

    /**
     * Disparado quando for necessário exibir ou ocultar o loader da tela
     */
    'cementina-loader': CustomEvent<PageLoader>;
  }
}

export type Nullable <T> = null | T;

export interface FunctionSucceededPattern <T = null> {
  data: T;
  succeeded: true;
}

export interface FunctionErrorPattern {
  succeeded: false;
  message: string;
}

export type ResponsePattern <T> = FunctionSucceededPattern<T> | FunctionErrorPattern;

export type ResponsePatternCallback = (...params: any) => void;
