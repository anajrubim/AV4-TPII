import { Cliente, Acomodacao, Hospedagem, NomeAcomodacao, TipoDocumento } from '../types';

function uid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}


const KEYS = {
  clientes: 'atlantis:clientes',
  hospedagens: 'atlantis:hospedagens',
};

function criarAcomodacoes(): Acomodacao[] {
  return [
    { id: 'ac-1', nomeAcomodacao: NomeAcomodacao.SolteiroSimples, camaSolteiro: 1, camaCasal: 0, suite: 1, climatizacao: true, garagem: 0 },
    { id: 'ac-2', nomeAcomodacao: NomeAcomodacao.SolteiroMais,    camaSolteiro: 1, camaCasal: 0, suite: 1, climatizacao: true, garagem: 1 },
    { id: 'ac-3', nomeAcomodacao: NomeAcomodacao.CasalSimples,    camaSolteiro: 0, camaCasal: 1, suite: 1, climatizacao: true, garagem: 0 },
    { id: 'ac-4', nomeAcomodacao: NomeAcomodacao.FamiliaSimples,  camaSolteiro: 2, camaCasal: 1, suite: 0, climatizacao: true, garagem: 1 },
    { id: 'ac-5', nomeAcomodacao: NomeAcomodacao.FamiliaMais,     camaSolteiro: 5, camaCasal: 1, suite: 1, climatizacao: true, garagem: 2 },
    { id: 'ac-6', nomeAcomodacao: NomeAcomodacao.FamiliaSuper,    camaSolteiro: 6, camaCasal: 2, suite: 2, climatizacao: true, garagem: 3 },
  ];
}

function criarClientesExemplo(): Cliente[] {
  return [
    {
      id: uid(),
      nome: 'Ana Carvalho',
      nomeSocial: 'Ana',
      dataNascimento: new Date('1990-05-14'),
      dataCadastro: new Date('2024-01-10'),
      telefones: [{ ddd: '11', numero: '98765-4321' }],
      endereco: { rua: 'Rua das Flores, 42', bairro: 'Jardim Primavera', cidade: 'São Paulo', estado: 'SP', pais: 'Brasil', codigoPostal: '01310-100' },
      documentos: [{ numero: '123.456.789-00', tipo: TipoDocumento.CPF, dataExpedicao: new Date('2010-03-01') }],
      dependentes: [],
    },
    {
      id: uid(),
      nome: 'Carlos Mendes',
      nomeSocial: 'Carlos',
      dataNascimento: new Date('1985-11-22'),
      dataCadastro: new Date('2024-02-15'),
      telefones: [{ ddd: '21', numero: '99123-4567' }],
      endereco: { rua: 'Av. Atlântica, 800', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ', pais: 'Brasil', codigoPostal: '22010-000' },
      documentos: [{ numero: '987.654.321-00', tipo: TipoDocumento.CPF, dataExpedicao: new Date('2008-07-15') }],
      dependentes: [],
    },
  ];
}


function salvarLocal() {
  localStorage.setItem(KEYS.clientes, JSON.stringify(estado.clientes));
  localStorage.setItem(KEYS.hospedagens, JSON.stringify(estado.hospedagens));
}

function carregarClientes(): Cliente[] {
  const raw = localStorage.getItem(KEYS.clientes);
  if (!raw) return criarClientesExemplo(); 
  const parsed = JSON.parse(raw) as Cliente[];
  return parsed.map((c) => ({
    ...c,
    dataNascimento: new Date(c.dataNascimento),
    dataCadastro: new Date(c.dataCadastro),
    documentos: c.documentos.map((d) => ({ ...d, dataExpedicao: new Date(d.dataExpedicao) })),
  }));
}

function carregarHospedagens(): Hospedagem[] {
  const raw = localStorage.getItem(KEYS.hospedagens);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as Hospedagem[];
  return parsed.map((h) => ({
    ...h,
    dataEntrada: new Date(h.dataEntrada),
    dataSaida: h.dataSaida ? new Date(h.dataSaida) : null,
  }));
}

interface EstadoAtlantis {
  clientes: Cliente[];
  acomodacoes: Acomodacao[];
  hospedagens: Hospedagem[];
}

const estado: EstadoAtlantis = {
  clientes: carregarClientes(),
  acomodacoes: criarAcomodacoes(),
  hospedagens: carregarHospedagens(),
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notificar() {
  salvarLocal();
  listeners.forEach((fn) => fn());
}

export const Armazem = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getClientes: (): Cliente[] => estado.clientes,
  getAcomodacoes: (): Acomodacao[] => estado.acomodacoes,
  getHospedagens: (): Hospedagem[] => estado.hospedagens,

  getClienteById: (id: string) => estado.clientes.find((c) => c.id === id),
  getAcomodacaoById: (id: string) => estado.acomodacoes.find((a) => a.id === id),
  getHospedagemAtiva: (clienteId: string) =>
    estado.hospedagens.find((h) => h.clienteId === clienteId && h.dataSaida === null),

  adicionarCliente(dados: Omit<Cliente, 'id' | 'dataCadastro' | 'dependentes'>): Cliente {
    const novo: Cliente = { ...dados, id: uid(), dataCadastro: new Date(), dependentes: [] };
    estado.clientes.push(novo);
    notificar();
    return novo;
  },

  editarCliente(id: string, dados: Partial<Omit<Cliente, 'id' | 'dataCadastro'>>) {
    const idx = estado.clientes.findIndex((c) => c.id === id);
    if (idx === -1) return;
    estado.clientes[idx] = { ...estado.clientes[idx], ...dados };
    notificar();
  },

  removerCliente(id: string) {
    if (estado.hospedagens.some((h) => h.clienteId === id && h.dataSaida === null)) {
      throw new Error('Cliente possui hospedagem ativa e não pode ser removido.');
    }
    estado.clientes = estado.clientes.filter((c) => c.id !== id);
    notificar();
  },

  registrarHospedagem(clienteId: string, acomodacaoId: string): Hospedagem {
    if (Armazem.getHospedagemAtiva(clienteId)) throw new Error('Cliente já possui hospedagem ativa.');
    const nova: Hospedagem = { id: uid(), clienteId, acomodacaoId, dataEntrada: new Date(), dataSaida: null };
    estado.hospedagens.push(nova);
    notificar();
    return nova;
  },

  encerrarHospedagem(hospedagemId: string) {
    const idx = estado.hospedagens.findIndex((h) => h.id === hospedagemId);
    if (idx === -1) return;
    estado.hospedagens[idx].dataSaida = new Date();
    notificar();
  },

  removerHospedagem(hospedagemId: string) {
    estado.hospedagens = estado.hospedagens.filter((h) => h.id !== hospedagemId);
    notificar();
  },
};

import { useState, useEffect } from 'react';

export function useArmazem() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = Armazem.subscribe(() => forceUpdate((n) => n + 1));
    return () => { unsub(); };
  }, []);
  return Armazem;
}