
export const cartOperations = ({
  ADD: 'add',
  DELETE: 'delete',
  INCREASE: 'increase',
  DECREASE: 'decrease',
}) as const

export type CartOperations = typeof cartOperations

export type CartHandleOperations = CartOperations[keyof CartOperations];

export interface ResponseItem {
  /**
   * Identificador do produto
   */
  webflow_id: string;
  /**
   * Título do produto
   */
  name: string;
  /**
   * Identificador único do produto
   */
  slug: string;
  /**
   * Quantidade de itens no carrinho
   */
  quantity: number;
  // /**
  //  * URL da imagem destacada do produto
  //  */
  // image_url: string;
  /**
   * Preço de venda do produto
   */
  price: number;
  /**
   * Preço de capa do produto
   */
  full_price: number;
  /**
   * Identificador do SKU
   */
  sku_id: string;
}

export interface CartHandleResponse {
  /**
   * Lista dos produtos inclusos no carrinho
   */
  items: ResponseItem[];
  /**
   * Preço de venda do pedido
   */
  order_price: number;
  /**
   * Preço de capa do pedido
   */
  order_full_price: number;
  /**
   * Quantidade de unidades que o cliente possui no carrinho
   */
  cart_items: number;
  /**
   * Indica se o usuário é um assinante da editora
   */
  is_subscriber?: boolean;
}

export interface CartHandleItem {
  /**
   * Identificador público do SKU
   */
  public_id: string;
  /**
   * Quantidade de unidades do SKU
   */
  quantity: number;
  /**
   * Identificador único do produto
   */
  webflow_id: string;
}

export interface CartHandleParams {
  /**
   * Dados básicos do item
   */
  item: CartHandleItem;
  /**
   * Operação que será realizada
   */
  operation: CartHandleOperations;
  /**
   * Indica se a adição é para compra imediata
   * Em caso positivo, o produto será adicionado e todos os presentes serão removidos
   */
  immediate: boolean;
}

export type PriceGroup = Pick<ResponseItem, 'price' | 'full_price'>;
