
export interface ShippoAddress {
  /**
   * Primeira linha do endereço
   */
  address_line_1: string;
  /**
   * Segunda linha do endereço
   */
  address_line_2: string;
  /**
   * Nome da cidade
   */
  city_locality: string;
  /**
   * Abreviação do estado
   */
  state_province: string;
  /**
   * Código postal do endereço
   */
  postal_code: string;
  /**
   * Código do país
   */
  country_code: string;
}

export type ShippoAddressInput = Omit<ShippoAddress, 'address_line_2' | 'country_code'> & Partial <Pick<ShippoAddress, 'address_line_2' | 'country_code'>>;

export interface RecommendedAddress extends ShippoAddress {
  /**
   * Resumo do endereço
   */
  complete_address: string;
}

export interface ShippoPartiallyValid {
  /**
   * Indica o status retornado pelo método de validação
   */
  status: 'partially_valid';
  /**
   * Endereço recomendado
   */
  recommended: RecommendedAddress;
  /**
   * Token de validação do endereço
   */
  validator: string;
}

export interface ShippoValid {
  /**
   * Indica o status retornado pelo método de validação
   */
  status: 'valid';
  /**
   * Token de validação do endereço
   */
  validator: string;
}

export interface ShippoInvalid {
  /**
   * Indica o status retornado pelo método de validação
   */
  status: 'invalid';
  /**
   * Mensagem indicando o motivo da falha
   */
  message: string;
}

export type ShippoValidationResponse = ShippoValid | ShippoPartiallyValid | ShippoInvalid;
