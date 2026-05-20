import { useState } from 'react';
import { Cliente, TipoDocumento, Documento, Telefone, Endereco } from '../types';
import { Armazem } from '../store/armazem';
import { toast } from './Toast';

interface Props {
  cliente?: Cliente;
  onClose: () => void;
}

function emptyEndereco(): Endereco {
  return { rua: '', bairro: '', cidade: '', estado: '', pais: 'Brasil', codigoPostal: '' };
}

export default function ClienteModal({ cliente, onClose }: Props) {
  const editando = !!cliente;

  const [nome, setNome] = useState(cliente?.nome ?? '');
  const [nomeSocial, setNomeSocial] = useState(cliente?.nomeSocial ?? '');
  const [dataNascimento, setDataNascimento] = useState(
    cliente?.dataNascimento
      ? new Date(cliente.dataNascimento).toISOString().split('T')[0]
      : ''
  );
  const [telefones, setTelefones] = useState<Telefone[]>(
    cliente?.telefones.length ? cliente.telefones : [{ ddd: '', numero: '' }]
  );
  const [endereco, setEndereco] = useState<Endereco>(cliente?.endereco ?? emptyEndereco());
  const [documentos, setDocumentos] = useState<Documento[]>(
    cliente?.documentos.length
      ? cliente.documentos.map((d) => ({
          ...d,
          dataExpedicao: new Date(d.dataExpedicao),
        }))
      : []
  );

  function addTelefone() {
    setTelefones((prev) => [...prev, { ddd: '', numero: '' }]);
  }

  function removeTelefone(idx: number) {
    setTelefones((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateTelefone(idx: number, field: keyof Telefone, value: string) {
    setTelefones((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  }

  function addDocumento() {
    setDocumentos((prev) => [
      ...prev,
      { numero: '', tipo: TipoDocumento.CPF, dataExpedicao: new Date() },
    ]);
  }

  function removeDocumento(idx: number) {
    setDocumentos((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateDocumento(idx: number, field: keyof Documento, value: string) {
    setDocumentos((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        if (field === 'tipo') return { ...d, tipo: value as TipoDocumento };
        if (field === 'dataExpedicao') return { ...d, dataExpedicao: new Date(value) };
        return { ...d, [field]: value };
      })
    );
  }

  function handleSalvar() {
    if (!nome.trim()) {
      toast('Nome é obrigatório.', 'error');
      return;
    }
    if (!dataNascimento) {
      toast('Data de nascimento é obrigatória.', 'error');
      return;
    }

    const telefonesValidos = telefones.filter((t) => t.numero.trim());
    const dados = {
      nome: nome.trim(),
      nomeSocial: nomeSocial.trim() || nome.trim(),
      dataNascimento: new Date(dataNascimento + 'T12:00:00'),
      telefones: telefonesValidos,
      endereco,
      documentos,
      dependentes: [],
    };

    try {
      if (editando) {
        Armazem.editarCliente(cliente!.id, dados);
        toast('Cliente atualizado com sucesso.', 'success');
      } else {
        Armazem.adicionarCliente(dados);
        toast('Cliente cadastrado com sucesso.', 'success');
      }
      onClose();
    } catch (e: any) {
      toast(e.message ?? 'Erro ao salvar.', 'error');
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{editando ? 'Editar Hóspede' : 'Novo Hóspede'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-section-title">Dados Pessoais</div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label>Nome completo *</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do hóspede" />
            </div>
            <div className="form-field">
              <label>Nome social</label>
              <input value={nomeSocial} onChange={(e) => setNomeSocial(e.target.value)} placeholder="Como prefere ser chamado" />
            </div>
            <div className="form-field">
              <label>Data de nascimento *</label>
              <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">Endereço</div>
          <div className="form-grid">
            <div className="form-field span-2">
              <label>Rua / Logradouro</label>
              <input value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} placeholder="Ex: Rua das Palmeiras, 100" />
            </div>
            <div className="form-field">
              <label>Bairro</label>
              <input value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} placeholder="Bairro" />
            </div>
            <div className="form-field">
              <label>Cidade</label>
              <input value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} placeholder="Cidade" />
            </div>
            <div className="form-field">
              <label>Estado</label>
              <input value={endereco.estado} onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })} placeholder="UF" maxLength={2} />
            </div>
            <div className="form-field">
              <label>CEP</label>
              <input value={endereco.codigoPostal} onChange={(e) => setEndereco({ ...endereco, codigoPostal: e.target.value })} placeholder="00000-000" />
            </div>
            <div className="form-field">
              <label>País</label>
              <input value={endereco.pais} onChange={(e) => setEndereco({ ...endereco, pais: e.target.value })} placeholder="País" />
            </div>
          </div>

          <div className="form-section-title">Telefones</div>
          <div className="telefone-list">
            {telefones.map((t, idx) => (
              <div className="telefone-row" key={idx}>
                <input value={t.ddd} onChange={(e) => updateTelefone(idx, 'ddd', e.target.value)} placeholder="DDD" maxLength={3} />
                <input value={t.numero} onChange={(e) => updateTelefone(idx, 'numero', e.target.value)} placeholder="Número" />
                <button className="btn btn-danger btn-sm" onClick={() => removeTelefone(idx)} type="button">✕</button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addTelefone} type="button" style={{ alignSelf: 'flex-start' }}>
              + Adicionar telefone
            </button>
          </div>

          <div className="form-section-title">Documentos</div>
          <div className="documento-list">
            {documentos.map((doc, idx) => (
              <div className="documento-row" key={idx}>
                <div className="form-field">
                  <label>Tipo</label>
                  <select value={doc.tipo} onChange={(e) => updateDocumento(idx, 'tipo', e.target.value)}>
                    {Object.entries(TipoDocumento).map(([k, v]) => (
                      <option key={k} value={v}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Número</label>
                  <input value={doc.numero} onChange={(e) => updateDocumento(idx, 'numero', e.target.value)} placeholder="Nº do documento" />
                </div>
                <div className="form-field">
                  <label>Expedição</label>
                  <input
                    type="date"
                    value={new Date(doc.dataExpedicao).toISOString().split('T')[0]}
                    onChange={(e) => updateDocumento(idx, 'dataExpedicao', e.target.value)}
                  />
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeDocumento(idx)} type="button" style={{ marginBottom: 0 }}>✕</button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={addDocumento} type="button" style={{ alignSelf: 'flex-start' }}>
              + Adicionar documento
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSalvar}>
            {editando ? 'Salvar alterações' : 'Cadastrar hóspede'}
          </button>
        </div>
      </div>
    </div>
  );
}
