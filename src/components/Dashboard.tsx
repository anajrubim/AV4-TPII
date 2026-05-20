import { useArmazem } from '../store/armazem';

export default function Dashboard() {
  const loja = useArmazem();
  const clientes = loja.getClientes();
  const acomodacoes = loja.getAcomodacoes();
  const hospedagens = loja.getHospedagens();
  const ativas = hospedagens.filter((h) => h.dataSaida === null);
  const encerradas = hospedagens.filter((h) => h.dataSaida !== null);

  const atividadesRecentes = [...hospedagens]
    .sort((a, b) => {
      const dateA = a.dataSaida ?? a.dataEntrada;
      const dateB = b.dataSaida ?? b.dataEntrada;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Bem-vindo ao <em>Atlantis</em>
          </h1>
          <p className="page-subtitle">Visão geral do sistema hoteleiro</p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--stone-dark)' }}>
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Hóspedes cadastrados</div>
          <div className="stat-value">{clientes.length}</div>
          <div className="stat-sub">clientes no sistema</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Acomodações</div>
          <div className="stat-value">{acomodacoes.length}</div>
          <div className="stat-sub">tipos disponíveis</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hospedagens ativas</div>
          <div className="stat-value" style={{ color: 'var(--teal)' }}>{ativas.length}</div>
          <div className="stat-sub">check-ins em aberto</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hospedagens encerradas</div>
          <div className="stat-value" style={{ color: 'var(--stone-dark)' }}>{encerradas.length}</div>
          <div className="stat-sub">check-outs realizados</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title">Atividade Recente</div>
          {atividadesRecentes.length === 0 ? (
            <p style={{ color: 'var(--stone-dark)', fontSize: 13 }}>Nenhuma atividade registrada.</p>
          ) : (
            <div className="activity-list">
              {atividadesRecentes.map((h) => {
                const cliente = loja.getClienteById(h.clienteId);
                const acomod = loja.getAcomodacaoById(h.acomodacaoId);
                const isEncerrada = h.dataSaida !== null;
                return (
                  <div className="activity-item" key={h.id}>
                    <div
                      className="activity-dot"
                      style={{ background: isEncerrada ? 'var(--stone)' : 'var(--gold)' }}
                    />
                    <div className="activity-content">
                      <div className="activity-title">
                        {isEncerrada ? 'Check-out' : 'Check-in'} — {cliente?.nome ?? '—'}
                      </div>
                      <div className="activity-time">
                        {acomod?.nomeAcomodacao} ·{' '}
                        {new Date(isEncerrada ? h.dataSaida! : h.dataEntrada).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span className={`badge ${isEncerrada ? 'badge-inactive' : 'badge-active'}`}>
                      {isEncerrada ? 'encerrada' : 'ativa'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Hóspedes em estadia</div>
          {ativas.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <div className="empty-state-text" style={{ fontSize: 15 }}>Sem hospedagens ativas</div>
              <div className="empty-state-sub">Registre uma nova hospedagem para começar</div>
            </div>
          ) : (
            <div className="activity-list">
              {ativas.map((h) => {
                const cliente = loja.getClienteById(h.clienteId);
                const acomod = loja.getAcomodacaoById(h.acomodacaoId);
                const dias = Math.floor(
                  (Date.now() - new Date(h.dataEntrada).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div className="activity-item" key={h.id}>
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <div className="activity-title">{cliente?.nome ?? '—'}</div>
                      <div className="activity-time">
                        {acomod?.nomeAcomodacao} · {dias === 0 ? 'Entrou hoje' : `${dias} dia(s)`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
