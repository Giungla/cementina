
export const deliveryType = ({
  /**
   * Representa pedidos com endereço de cobrança e entrega iguais
   */
  SAME: 'same',
  /**
   * Representa pedidos com endereços de cobrança e entrega diferentes
   */
  DIFF: 'diff',
}) as const

export type DeliveryType = typeof deliveryType

export type DeliveryTypes = DeliveryType[keyof DeliveryType]

export interface DeliveryPlace {
  /**
   * Identificador do tipo do endereço de entrega
   */
  token: DeliveryTypes;
  /**
   * Label que será exibido ao usuário
   */
  label: string;
}

export interface ShippoRate {
  /**
   * Preço transformado em centavos
   */
  amount: number;
  /**
   * Moeda em que a simulação foi retornada
   */
  currency: string;
  /**
   * Nome do serviço de entrega
   */
  display_name: string;
  /**
   * Identificador do serviço de entrega
   */
  object_id: string;
  /**
   * Atributos do serviço
   */
  attributes: string[];
  /**
   * Quantidade de dias estimados até a entrega
   */
  estimated_days: number;
}

export interface ParsedShippoRate {
  /**
   * Preço tratado em USD
   */
  amount: string;
  /**
   * Nome do serviço de entrega
   */
  display_name: string;
  /**
   * Identificador do serviço de entrega
   */
  object_id: string;
  /**
   * Atributos do serviço
   */
  attributes: string[];
  /**
   * Quantidade de dias estimados até a entrega
   */
  estimated_days: string;
}

export interface ShippoShipment {
  /**
   * Status da simulação
   */
  status: string;
  /**
   * ID da simulação no padrão ObjectId
   */
  object_id: string;
  /**
   * Lista de simulações retornadas
   */
  rates: ShippoRate[];
}
