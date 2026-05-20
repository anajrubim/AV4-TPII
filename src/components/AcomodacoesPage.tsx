import { useArmazem } from '../store/armazem';

const ICONS: Record<string, string> = {
  camaSolteiro: '',
  camaCasal: '',
  suite: '',
  climatizacao: '',
  garagem: '',
};

export default function AcomodacoesPage() {
  const loja = useArmazem();
  const acomodacoes = loja.getAcomodacoes();
  const hospedagens = loja.getHospedagens();

  function ocupadas(acomodId: string) {
    return hospedagens.filter((h) => h.acomodacaoId === acomodId && h.dataSaida === null).length;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <em>Acomodações</em>
          </h1>
          <p className="page-subtitle">Catálogo de acomodações disponíveis no Atlantis</p>
        </div>
      </div>

      <div className="acomod-grid">
        {acomodacoes.map((a) => {
          const qtdOcupadas = ocupadas(a.id);
          return (
            <div className="acomod-card" key={a.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div className="acomod-name">{a.nomeAcomodacao}</div>
                {qtdOcupadas > 0 && (
                  <span className="badge badge-active" style={{ flexShrink: 0, marginLeft: 8 }}>
                    ● {qtdOcupadas} ativa(s)
                  </span>
                )}
              </div>

              <div className="acomod-details">
                <div className="acomod-detail">
                  <span>{ICONS.camaSolteiro} Cama solteiro</span>
                  <strong>{String(a.camaSolteiro)}</strong>
                </div>
                <div className="acomod-detail">
                  <span>{ICONS.camaCasal} Cama casal</span>
                  <strong>{String(a.camaCasal)}</strong>
                </div>
                <div className="acomod-detail">
                  <span>{ICONS.suite} Suíte(s)</span>
                  <strong>{String(a.suite)}</strong>
                </div>
                <div className="acomod-detail">
                  <span>{ICONS.garagem} Garagem</span>
                  <strong>{String(a.garagem)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {a.climatizacao && (
                  <span className="badge badge-gold"> Climatizada</span>
                )}
                {Number(a.garagem) > 0 && (
                  <span className="badge badge-gold"> Garagem</span>
                )}
                {Number(a.suite) > 0 && (
                  <span className="badge badge-gold"> Suíte</span>
                )}
              </div>

              <div className="divider" style={{ margin: '12px 0' }} />
              <div style={{ fontSize: 12, color: 'var(--stone-dark)' }}>
                ID: <code style={{ fontFamily: 'monospace', fontSize: 11 }}>{a.id}</code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
