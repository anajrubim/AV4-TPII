import { useState } from 'react';
import { useArmazem } from '../store/armazem';
import { Hospedagem } from '../types';
import { toast } from './Toast';

type Filtro = 'todas' | 'ativas' | 'encerradas';

export default function HospedagensPage() {
  const loja = useArmazem();
  const hospedagens = loja.getHospedagens();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [modalNova, setModalNova] = useState(false);
  const [busca, setBusca] = useState('');

  const filtradas = hospedagens.filter((h) => {
    if (filtro === 'ativas' && h.dataSaida !== null) return false;
    if (filtro === 'encerradas' && h.dataSaida === null) return false;
    const cliente = loja.getClienteById(h.clienteId);
    if (busca && !cliente?.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  function encerrar(h: Hospedagem) {
    const cliente = loja.getClienteById(h.clienteId);
    if (!confirm(`Encerrar hospedagem de "${cliente?.nome}"?`)) return;
    loja.encerrarHospedagem(h.id);
    toast('Hospedagem encerrada. Check-out realizado!', 'success');
  }

  function remover(h: Hospedagem) {
    if (!confirm('Remover este registro de hospedagem?')) return;
    loja.removerHospedagem(h.id);
    toast('Registro removido.', 'success');
  }

  const ativas = hospedagens.filter((h) => h.dataSaida === null).length;
  const encerradas = hospedagens.filter((h) => h.dataSaida !== null).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <em>Hospedagens</em>
          </h1>
          <p className="page-subtitle">Registro de check-ins e check-outs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalNova(true)}>
          + Registrar hospedagem
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['todas', 'ativas', 'encerradas'] as Filtro[]).map((f) => (
          <button
            key={f}
            className={`btn ${filtro === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todas' ? `Todas (${hospedagens.length})`
              : f === 'ativas' ? `Ativas (${ativas})`
              : `Encerradas (${encerradas})`}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input placeholder="Buscar por nome do hóspede..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        {filtradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">Nenhuma hospedagem encontrada</div>
            <div className="empty-state-sub">
              {busca ? 'Tente outro nome.' : 'Registre a primeira hospedagem.'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Hóspede</th>
                  <th>Acomodação</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Duração</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((h) => {
                  const cliente = loja.getClienteById(h.clienteId);
                  const acomod = loja.getAcomodacaoById(h.acomodacaoId);
                  const ativa = h.dataSaida === null;
                  const fim = h.dataSaida ? new Date(h.dataSaida) : new Date();
                  const dias = Math.max(
                    0,
                    Math.floor((fim.getTime() - new Date(h.dataEntrada).getTime()) / (1000 * 60 * 60 * 24))
                  );

                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 500 }}>{cliente?.nome ?? <em style={{ color: 'var(--stone)' }}>removido</em>}</td>
                      <td style={{ maxWidth: 220, fontSize: 12 }}>
                        {acomod?.nomeAcomodacao ?? '—'}
                      </td>
                      <td>{new Date(h.dataEntrada).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {h.dataSaida ? new Date(h.dataSaida).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td>
                        <span className="badge badge-gold">{dias === 0 ? 'Hoje' : `${dias} dia(s)`}</span>
                      </td>
                      <td>
                        {ativa
                          ? <span className="badge badge-active">● ativa</span>
                          : <span className="badge badge-inactive">encerrada</span>}
                      </td>
                      <td>
                        <div className="actions-row">
                          {ativa && (
                            <button className="btn btn-teal btn-sm" onClick={() => encerrar(h)}>
                              Check-out
                            </button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => remover(h)}>
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

      {modalNova && <NovaHospedagemModal onClose={() => setModalNova(false)} />}
    </div>
  );
}

function NovaHospedagemModal({ onClose }: { onClose: () => void }) {
  const loja = useArmazem();
  const clientes = loja.getClientes();
  const acomodacoes = loja.getAcomodacoes();

  const [clienteId, setClienteId] = useState('');
  const [acomodacaoId, setAcomodacaoId] = useState('');

  const clientesDisponiveis = clientes.filter((c) => !loja.getHospedagemAtiva(c.id));

  function handleRegistrar() {
    if (!clienteId) {
      toast('Selecione um hóspede.', 'error');
      return;
    }
    if (!acomodacaoId) {
      toast('Selecione uma acomodação.', 'error');
      return;
    }
    try {
      loja.registrarHospedagem(clienteId, acomodacaoId);
      toast('Hospedagem registrada! Check-in realizado.', 'success');
      onClose();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Nova Hospedagem</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {clientesDisponiveis.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">Nenhum hóspede disponível</div>
              <div className="empty-state-sub">Todos os hóspedes cadastrados já possuem hospedagem ativa.</div>
            </div>
          ) : (
            <>
              <div className="form-section-title">Selecionar Hóspede</div>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>Hóspede *</label>
                <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">— Selecione —</option>
                  {clientesDisponiveis.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.nomeSocial})</option>
                  ))}
                </select>
              </div>

              <div className="form-section-title">Selecionar Acomodação</div>
              <div className="form-field">
                <label>Acomodação *</label>
                <select value={acomodacaoId} onChange={(e) => setAcomodacaoId(e.target.value)}>
                  <option value="">— Selecione —</option>
                  {acomodacoes.map((a) => (
                    <option key={a.id} value={a.id}>{a.nomeAcomodacao}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          {clientesDisponiveis.length > 0 && (
            <button className="btn btn-primary" onClick={handleRegistrar}>
              Confirmar check-in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
