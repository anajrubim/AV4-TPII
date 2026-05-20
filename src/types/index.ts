export enum TipoDocumento {
  CPF = 'Cadastro de Pessoas Física',
  RG = 'Registro Geral',
  Passaporte = 'Passaporte',
}

export enum NomeAcomodacao {
  SolteiroSimples = 'Acomodação simples para solteiro(a)',
  CasalSimples = 'Acomodação simples para casal',
  FamiliaSimples = 'Acomodação para família com até duas crianças',
  FamiliaMais = 'Acomodação para família com até cinco crianças',
  SolteiroMais = 'Acomodação com garagem para solteiro(a)',
  FamiliaSuper = 'Acomodação para até duas famílias, casal e três crianças cada',
}

export interface Telefone {
  ddd: string;
  numero: string;
}

export interface Endereco {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  codigoPostal: string;
}

export interface Documento {
  numero: string;
  tipo: TipoDocumento;
  dataExpedicao: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  nomeSocial: string;
  dataNascimento: Date;
  dataCadastro: Date;
  telefones: Telefone[];
  endereco?: Endereco;
  documentos: Documento[];
  dependentes: Cliente[];
  titularId?: string;
}

export interface Acomodacao {
  id: string;
  nomeAcomodacao: NomeAcomodacao;
  camaSolteiro: number;
  camaCasal: number;
  suite: number;
  climatizacao: boolean;
  garagem: number;
}

export interface Hospedagem {
  id: string;
  clienteId: string;
  acomodacaoId: string;
  dataEntrada: Date;
  dataSaida: Date | null;
}

export type Tab = 'dashboard' | 'clientes' | 'acomodacoes' | 'hospedagens';
