
import {
  Nullable,
} from './global'

type ProductVariation = 'color' | 'size'

type ColorVariations = 'base' | 'swisscoffee' | 'balboamist' | 'annapolisgray' | 'cumuluscloud' | 'thunder' | 'cobblestone'

interface ColorVariant {
  /**
   * Tipo da variação
   */
  variation_type: Exclude<ProductVariation, 'size'>;
  /**
   * Identificador da variação
   */
  variation_item: ColorVariations;
}

interface SizeVariant {
  /**
   * Tipo da variação
   */
  variation_type: Exclude<ProductVariation, 'color'>;
  /**
   * Identificador da variação
   */
  variation_item: 'A' | 'B';
}

type Variants = ColorVariant | SizeVariant;

interface BaseSKU {
  /**
   * Identificador público do SKU
   */
  public_id: string;
  /**
   * Preço de venda do produto em centavos
   */
  price: number;
  /**
   * Preço de capa do produto em centavos
   */
  full_price: number;
}

export type SKU = BaseSKU & Variants;

export type ResumedSKU = Pick<SKU, 'public_id' | 'price' | 'full_price' | 'variation_type' | 'variation_item'>

export interface VariationGroup {
  /**
   * Identifica o grupo de variações
   */
  group: ProductVariation;
  /**
   * Lista os itens presentes no grupo
   */
  items: ResumedSKU[];
}

export interface SingleProductResponse {
  /**
   * Nome do produto
   */
  name: string;
  /**
   * Identificador do produto fornecido Webflow
   */
  webflow_id: string;
  /**
   * Agrupamento das variações
   */
  variations: Partial<Record<ProductVariation, SKU[]>>;
}

export interface ProductStateDynamic {
  /**
   * Preço com desconto do produto
   */
  price: number;
  /**
   * Preço de capa do produto
   */
  full_price: number;
  /**
   * Preço computado
   * Soma do valor do item multiplicado pela quantidade + eventual valor do frete
   */
  final_price: number;
}

export interface ProductState {
  /**
   * Indica o SKU selecionado
   */
  selectedSku: Nullable<string>;
  /**
   * Quantidade de unidades selecionada
   */
  quantity: number;
  /**
   * Variações por cor
   */
  colorSkus: ResumedSKU[];
  /**
   * Identificador do produto fornecido Webflow
   */
  webflow_id: Nullable<string>;
  /**
   * Detalhes da simulação de entrega
   */
  productShipment: Nullable<SingleProductShipment>;
}

export interface SingleProductShipmentParams {
  /**
   * Quantidade de unidades que serão usadas na simulação
   */
  quantity: number;
  /**
   * Zipcode do endereço que será usado na simulação
   */
  zip_code: string;
  /**
   * Identificador do produto fornecido pelo Webflow
   */
  webflow_id: string;
}

export interface SingleProductShipment {
  /**
   * Símbolo da moeda em que a cotação foi realizada
   */
  currency: string;
  /**
   * Valor da cotação em centavos
   */
  amount: number;
  /**
   * Valor da cotação formatado na moeda indicada em `currency`
   */
  parsed_amount: string;
  /**
   * Nome da transportadora
   */
  carrier_name: string;
}
