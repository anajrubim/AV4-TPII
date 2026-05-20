import { useState } from 'react';
import { useArmazem } from '../store/armazem';
import { Cliente } from '../types';
import ClienteModal from './ClienteModal';
import { toast } from './Toast';

export default function ClientesPage() {
  const loja = useArmazem();
  const clientes = loja.getClientes();
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState<'novo' | 'editar' | 'detalhe' | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const filtrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.nomeSocial.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirDetalhe(c: Cliente) {
    setClienteSelecionado(c);
    setModal('detalhe');
  }

  function abrirEditar(c: Cliente) {
    setClienteSelecionado(c);
    setModal('editar');
  }

  function remover(c: Cliente) {
    if (!confirm(`Remover o hóspede "${c.nome}"?`)) return;
    try {
      loja.removerCliente(c.id);
      toast('Hóspede removido.', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <em>Hóspedes</em>
          </h1>
          <p className="page-subtitle">Gerencie os clientes cadastrados no sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('novo')}>
          + Novo hóspede
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Buscar por nome ou nome social..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">Nenhum hóspede encontrado</div>
            <div className="empty-state-sub">
              {busca ? 'Tente outro termo de busca.' : 'Clique em "Novo hóspede" para começar.'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Nome social</th>
                  <th>Nascimento</th>
                  <th>Cadastro</th>
                  <th>Documentos</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => {
                  const hospedagemAtiva = loja.getHospedagemAtiva(c.id);
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.nome}</td>
                      <td style={{ color: 'var(--stone-dark)' }}>{c.nomeSocial}</td>
                      <td>{new Date(c.dataNascimento).toLocaleDateString('pt-BR')}</td>
                      <td>{new Date(c.dataCadastro).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <span className="badge badge-gold">{c.documentos.length} doc(s)</span>
                      </td>
                      <td>
                        {hospedagemAtiva ? (
                          <span className="badge badge-active">● em estadia</span>
                        ) : (
                          <span className="badge badge-inactive">disponível</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-row">
                          <button className="btn btn-secondary btn-sm" onClick={() => abrirDetalhe(c)}>
                            Ver
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => abrirEditar(c)}>
                            Editar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => remover(c)}>
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal === 'novo' && <ClienteModal onClose={() => setModal(null)} />}
      {modal === 'editar' && clienteSelecionado && (
        <ClienteModal cliente={clienteSelecionado} onClose={() => setModal(null)} />
      )}
      {modal === 'detalhe' && clienteSelecionado && (
        <DetalheClienteModal cliente={clienteSelecionado} onClose={() => setModal(null)} onEditar={() => setModal('editar')} />
      )}
    </div>
  );
}

function DetalheClienteModal({ cliente, onClose, onEditar }: { cliente: Cliente; onClose: () => void; onEditar: () => void }) {
  const loja = useArmazem();
  const hospedagens = loja.getHospedagens().filter((h) => h.clienteId === cliente.id);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">{cliente.nome}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <div className="detail-label">Nome social</div>
              <div className="detail-value">{cliente.nomeSocial}</div>
            </div>
            <div>
              <div className="detail-label">Data de nascimento</div>
              <div className="detail-value">{new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</div>
            </div>
            <div>
              <div className="detail-label">Cadastrado em</div>
              <div className="detail-value">{new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          {cliente.endereco && (
            <>
              <div className="divider" />
              <div className="form-section-title">Endereço</div>
              <div className="detail-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <div className="detail-label">Logradouro</div>
                  <div className="detail-value">{cliente.endereco.rua || '—'}</div>
                </div>
                <div>
                  <div className="detail-label">Bairro</div>
                  <div className="detail-value">{cliente.endereco.bairro || '—'}</div>
                </div>
                <div>
                  <div className="detail-label">Cidade / UF</div>
                  <div className="detail-value">{cliente.endereco.cidade}{cliente.endereco.estado ? ` / ${cliente.endereco.estado}` : ''}</div>
                </div>
                <div>
                  <div className="detail-label">CEP</div>
                  <div className="detail-value">{cliente.endereco.codigoPostal || '—'}</div>
                </div>
                <div>
                  <div className="detail-label">País</div>
                  <div className="detail-value">{cliente.endereco.pais || '—'}</div>
                </div>
              </div>
            </>
          )}

          {cliente.telefones.length > 0 && (
            <>
              <div className="divider" />
              <div className="form-section-title">Telefones</div>
              {cliente.telefones.map((t, i) => (
                <div key={i} className="detail-value">({t.ddd}) {t.numero}</div>
              ))}
            </>
          )}

          {cliente.documentos.length > 0 && (
            <>
              <div className="divider" />
              <div className="form-section-title">Documentos</div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Tipo</th><th>Número</th><th>Expedição</th></tr>
                  </thead>
                  <tbody>
                    {cliente.documentos.map((d, i) => (
                      <tr key={i}>
                        <td>{Object.entries({ CPF: 'Cadastro de Pessoas Física', RG: 'Registro Geral', Passaporte: 'Passaporte' }).find(([, v]) => v === d.tipo)?.[0] ?? d.tipo}</td>
                        <td>{d.numero}</td>
                        <td>{new Date(d.dataExpedicao).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {hospedagens.length > 0 && (
            <>
              <div className="divider" />
              <div className="form-section-title">Histórico de Hospedagens</div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Acomodação</th><th>Entrada</th><th>Saída</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {hospedagens.map((h) => {
                      const ac = loja.getAcomodacaoById(h.acomodacaoId);
                      return (
                        <tr key={h.id}>
                          <td>{ac?.nomeAcomodacao ?? '—'}</td>
                          <td>{new Date(h.dataEntrada).toLocaleDateString('pt-BR')}</td>
                          <td>{h.dataSaida ? new Date(h.dataSaida).toLocaleDateString('pt-BR') : '—'}</td>
                          <td>
                            {h.dataSaida === null
                              ? <span className="badge badge-active">ativa</span>
                              : <span className="badge badge-inactive">encerrada</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
          <button className="btn btn-primary" onClick={onEditar}>Editar</button>
        </div>
      </div>
    </div>
  );
}
