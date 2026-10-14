
import {
  type Ref,
} from 'vue'

import {
  type ResponseItem,
  type CartHandleResponse,
} from './cart'

import {
  type Nullable,
} from './global'

import {
  type SquarePayload,
} from './square'

import {
  type PaymentTypes,
} from '../utils/payment'

import {
  type Card,
  type Payments,
  type GooglePay,
  type CardFieldNames,
} from '@square/web-sdk'

import {
  type SquareCardResume,
  type SquarePaymentToken,
} from '../utils/square'

import {
  type ShippoAddress,
  type RecommendedAddress,
  type ShippoAddressInput,
  type ShippoPartiallyValid,
} from './address'

import {
  type DeliveryPlace,
  type DeliveryTypes,
  type ShippoShipment,
} from './delivery'

export interface CheckoutUser {
  /**
   * Endereço de e-mail do usuário autenticado
   */
  email: string;
  /**
   * Telefone do usuário autenticado
   */
  telephone?: string;
  /**
   * Data de aniversário do usuário autenticado formatada no padrão DD/MM/YYYY
   */
  birthday?: string;
}

export interface CheckoutAppSetup {
  /**
   * Primeiro nome do usuário
   */
  customerGivenName: Ref<string>;

  /**
   * Sobrenome do usuário
   */
  customerFamilyName: Ref<string>;

  /**
   * Endereço de e-mail do usuário
   */
  customerMail: Ref<string>;

  /**
   * Telefone do usuário no padrão (000) 000-0000
   */
  customerPhone: Ref<string>;

  /**
   * Mensagem de validação para o endereço de entrega
   */
  shippingAddressValidationMessage: Ref<Nullable<string>>;

  /**
   * Recomendação de endereço quando couberem melhorias nos dados fornecidos
   */
  shippingRecommendedAddress: Ref<Nullable<RecommendedAddress & Pick<ShippoPartiallyValid, 'validator'>>>;

  /**
   * Resumo do endereço de entrega após validação
   */
  resumedShippingAddress: Ref<Nullable<string>>;

  /**
   * Referência para o elemento que exibe e captura o nome do respostável pela recepção durante a entrega
   */
  shippingRecipient: Ref<string>;

  /**
   * Zipcode do endereço de entrega
   */
  shippingZipCode: Ref<string>;

  /**
   * Primeira linha do endereço de entrega
   */
  shippingStreetAddress: Ref<string>;

  /**
   * Segunda linha do endereço de entrega
   */
  shippingStreetAddressLine2: Ref<string>;

  /**
   * Nome da cidade do endereço de entrega
   */
  shippingCity: Ref<string>;

  /**
   * Sigla do estado do endereço de entrega
   */
  shippingState: Ref<string>;

  /**
   * Token de validação do endereço de entrega
   */
  shippingAddressValidator: Ref<Nullable<string>>;

  /**
   * Mensagem de validação para o endereço de cobrança
   */
  billingAddressValidationMessage: Ref<Nullable<string>>;

  /**
   * Recomendação de endereço quando couberem melhorias nos dados fornecidos
   */
  billingRecommendedAddress: Ref<Nullable<RecommendedAddress & Pick<ShippoPartiallyValid, 'validator'>>>;

  /**
   * Resumo do endereço de cobrança após validação
   */
  resumedBillingAddress: Ref<Nullable<string>>;

  /**
   * Zipcode do endereço de entrega
   */
  billingZipCode: Ref<string>;

  /**
   * Primeira linha do endereço de cobrança
   */
  billingStreetAddress: Ref<string>;

  /**
   * Segunda linha do endereço de cobrança
   */
  billingStreetAddressLine2: Ref<string>;

  /**
   * Nome da cidade de cobrança
   */
  billingCity: Ref<string>;

  /**
   * Sigla do estado de cobrança
   */
  billingState: Ref<string>;

  /**
   * Token de validação do endereço de cobrança
   */
  billingAddressValidator: Ref<Nullable<string>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro para a seleção de um método de pagamento
   */
  paymentMethodMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento de seção que contem todos os campos do grupo de informações pessoais
   */
  customerPersonalDataSectionRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe e captura o primeiro nome do usuário
   */
  customerNameRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o sobrenome do usuário
   */
  customerFamilyNameRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o endereço de e-mail do usuário
   */
  customerMailRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o telefone do usuário
   */
  customerPhoneRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Rerefência ao wrapper responsável pela exibição do iframe
   * responsável pela captura dos dados de cartão da Square
   */
  squareCardWrapperRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que contém os campos destinados ao endereço de cobrança
   */
  billingAddressSectionRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe o endereço de cobrança de forma resumida
   */
  resumedBillingAddressRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe e captura o zipcode do endereço de cobrança do cartão
   */
  billingZipCodeRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a primeira linha do endereço de cobrança do cartão
   */
  billingStreetAddressRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome da cidade do endereço de cobrança
   */
  billingCityRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a sigla do endereço de cobrança
   */
  billingStateRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento responsável pela exibição dos elementos de seleção do `deliveryPlace`
   */
  deliveryPlaceSectionRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe a mensagem de erro para a seleção do `deliveryPlace`
   */
  deliveryPlaceMessageRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento responsável pela exibição dos elementos que compoem o form de endereço de entrega
   */
  shippingAddressSectionRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome do responsável pela recepção da entrega
   */
  shippingRecipientRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o zipcode do endereço de entrega
   */
  shippingZipCodeRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a primeira linha do endereço de entrega
   */
  shippingStreetAddressRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura o nome da cidade do endereço de entrega
   */
  shippingCityRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Referência ao elemento que exibe e captura a sigla do estado do endereço de entrega
   */
  shippingStateRef: Ref<Nullable<HTMLInputElement>>;

  /**
   * Lista os métodos de pagamento disponíveis
   */
  paymentMethods: Ref<CheckoutPaymentMethod[]>;

  /**
   * Mensagem de erro para exibição junto ao cartão selecionado
   */
  squareCardErrorField: Ref<CardFieldNames[]>;

  /**
   * Indica se existe uma tokenização de cartão em andamento
   */
  isTokenizingCard: Ref<boolean>;

  /**
   * Detalhes do cartão fornecido pelo usuário no ambiente da Square
   */
  squareCardResume: Ref<Nullable<SquareCardResume>>;

  /**
   * Instância para pagamento com cartão na Square
   */
  squareCardInstance: Ref<Nullable<Card>>;

  /**
   * Instância de pagamento com Google Pay na Square
   */
  squareGooglePayInstance: Ref<Nullable<GooglePay>>;

  /**
   * Indica a seleção do usuário para os tipos de endereços de entrega
   */
  deliveryPlace: Ref<Nullable<DeliveryTypes>>;

  /**
   * Local de entrega
   */
  deliveryPlaces: Ref<DeliveryPlace[]>;

  /**
   * Referência ao elemento que exibe as opções de entrega
   */
  deliveryOptionsSectionRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibirá a mensagem de erro em caso de eventuais falhas no fechamento do pedido
   */
  orderErrorSectionRef: Ref<Nullable<HTMLDivElement>>;

  /**
   * Referência ao elemento que exibirá o resumo dos preços do pedido juntamente com o botão responsável pelo fechamento de compra
   */
  orderResumeSectionRef: Ref<Nullable<HTMLDivElement>>;
}

export interface CheckoutAppData {
  /**
   * Indica se houve uma tentativa de submissão do formulário
   */
  submitted: boolean;

  /**
   * Indica se existe uma solicitação de pagamento em andamento
   */
  isSubmitting: boolean;

  /**
   * Indica se as opções de entrega estão sendo carregadas
   */
  isGettingDeliveryOptions: boolean;

  /**
   * Dados do carrinho obtidos do token de sessão
   */
  cart: Nullable<CartHandleResponse>;

  /**
   * Indica quais campos da aplicação foram visitados
   */
  visitedFields: string[];

  /**
   * Indica o tipo de pagamento selecionado
   */
  selectedPaymentMethod: Nullable<PaymentTypes>;

  /**
   * Dados da loja fornecidos pela Square
   */
  squareStoreInfo: Nullable<SquarePayload>;

  /**
   * Instância base da Square para geração de pagamentos, verificações e validações
   */
  squarePayment: Nullable<Payments>;

  /**
   * Dados do último token de pagamento gerado pela Square
   */
  squarePaymentToken: Nullable<SquarePaymentToken>;

  /**
   * Opção de entrega selecionada
   */
  deliveryOption: Nullable<string>;

  /**
   * Dados da simulação de entrega para o carrinho atual
   */
  deliveryOptions: Nullable<ShippoShipment>;

  /**
   * Registra a mensagem de erro em caso de falha no fechamento do pedido
   */
  orderError: Nullable<string>;
}

export interface CheckoutPaymentMethod {
  /**
   * Token que representa o método de pagamento
   */
  method: PaymentTypes;
  /**
   * Label para exibição no frontend
   */
  label: string;
}

export interface CheckoutInitialParams {
  /**
   * Envia o número do CEP informado pelo usuário em verificações anteriores no site
   */
  zipcode: Nullable<string>;
}

export interface CheckoutInitialPayload {
  /**
   * Dados do carrinho obtidos do token da sessão
   */
  cart: CartHandleResponse;
  /**
   * Dados do usuário autenticado
   */
  user?: CheckoutUser;
  /**
   * Dados da Square necessários no frontend
   */
  square: SquarePayload;
}

export interface FeedableUserFields {
  /**
   * Endereço de e-mail
   */
  email?: string;

  /**
   * Número de telefone
   */
  phone?: string;

  /**
   * Primeiro nome do cliente
   */
  given_name?: string;

  /**
   * Sobrenome do usuário
   */
  family_name?: string;
}

export interface CheckoutPayCustomer extends Required<FeedableUserFields> {
}

export interface CheckoutPay {
  /**
   * Token de pagamento gerado pela Square
   */
  source_id: string;
  /**
   * Dados pessoais do usuário
   */
  customer: CheckoutPayCustomer;
  /**
   * Identificador do serviço de entrega selecionado
   */
  delivery_option: string;
}

export type FinalCheckoutPay = CheckoutPay & CheckoutAddresses;

export interface CheckoutPayAddress extends Omit<ShippoAddress, 'country_code'> {
  /**
   * Token de validação do endereço
   */
  validator: string;
}

export interface CheckoutPayAddresses {
  /**
   * Token de identificação e validação do endereço de cobrança (usado apenas para cartão)
   */
  billing?: CheckoutPayAddress;
  /**
   * Token de identificação e validação do endereço de entrega
   */
  shipping?: CheckoutPayAddress;
}

export interface CheckoutPayDelivery {
  /**
   * Informa qual o `rate` que foi escolhido pelo usuário
   */
  rate: string;
}

export interface TokenizeCardResponse {
  /**
   * Token de pagamento fornecido pela Square
   */
  token: string;
  /**
   * Detalhes do cartão usado
   */
  cardResume: SquareCardResume;
}

export type IParsedAddress = Omit<ShippoAddress, 'country_code'>;

export interface ValidatableShippoAddress {
  validator: string;
}

export interface CheckoutCardSameAddress {
  /**
   * Dados do endereço de cobrança
   */
  billing_address: ShippoAddressInput & ValidatableShippoAddress;

  /**
   * Indica o local de entrega
   */
  delivery_place: 'same';
}

export interface CheckoutCardDiffAddress {
  /**
   * Dados do endereço de cobrança
   */
  billing_address: ShippoAddressInput & ValidatableShippoAddress;
  /**
   * Dados do endereço de entrega
   */
  shipping_address: ShippoAddressInput & ValidatableShippoAddress;
  /**
   * Indica o local de entrega
   */
  delivery_place: 'diff';
}

export type CheckoutAddresses = CheckoutCardSameAddress | CheckoutCardDiffAddress;

export interface RenderableProduct extends Pick<ResponseItem, 'name' | 'quantity'> {
  /**
   * Retorna o preço do produto formatado em USD
   */
  price: string;
  /**
   * Retorna o preço unitário multiplicado pela quantidade formatado em USD
   */
  finalPrice: string;
}
