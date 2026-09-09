
export interface User {
  /**
   * Identificador do usuário
   */
  id: number;
  /**
   * Primeiro nome do usuário
   */
  name: string;
  /**
   * Último nome do usuário
   */
  last_name: string;
  /**
   * Endereço de e-mail do usuário
   */
  email: string;
  /**
   * Telefone do usuário
   */
  phone: string;
  /**
   * Data de nascimento do usuário
   */
  birth_date: string;
}
