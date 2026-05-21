import { useState } from 'react';
import { Tab } from './types';
import { useArmazem } from './store/armazem';
import Dashboard from './components/Dashboard';
import ClientesPage from './components/ClientesPage';
import AcomodacoesPage from './components/AcomodacoesPage';
import HospedagensPage from './components/HospedagensPage';
import { useToast, ToastContainer } from './components/Toast';

const NAV_ITEMS: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'clientes',
    label: 'Hóspedes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'acomodacoes',
    label: 'Acomodações',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'hospedagens',
    label: 'Hospedagens',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 17l1-4h18l1 4" />
        <path d="M3.5 17H20.5a1 1 0 0 1 0 2H3.5a1 1 0 0 1 0-2z" />
        <path d="M5 13V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6" />
        <path d="M8 13V9h8v4" />
      </svg>
    ),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { toasts, addToast } = useToast();
  const loja = useArmazem();

  const clientes = loja.getClientes();
  const hospedagens = loja.getHospedagens();
  const ativas = hospedagens.filter((h) => h.dataSaida === null).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-logo">Atlantis</span>
          <span className="topbar-tagline">Sistema Hoteleiro</span>
        </div>
        <div className="topbar-info">
          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </header>
      <aside className="sidebar">
        <span className="sidebar-section-label">Menu</span>
        <ul className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>
        <div className='verdade'>
          NÃO AGUENTO MAIS AV
        </div>
        <div className="sidebar-stats">
          <div className="sidebar-section-label" style={{ padding: '0 0 8px' }}>Resumo</div>
          <div className="sidebar-stat">
            <span>Hóspedes</span>
            <span className="sidebar-stat-value">{clientes.length}</span>
          </div>
          <div className="sidebar-stat">
            <span>Em estadia</span>
            <span className="sidebar-stat-value" style={{ color: ativas > 0 ? 'var(--teal-light)' : 'var(--stone-dark)' }}>
              {ativas}
            </span>
          </div>
          <div className="sidebar-stat">
            <span>Total hospedagens</span>
            <span className="sidebar-stat-value">{hospedagens.length}</span>
          </div>
        </div>
      </aside>
      <main className="main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'clientes' && <ClientesPage />}
        {activeTab === 'acomodacoes' && <AcomodacoesPage />}
        {activeTab === 'hospedagens' && <HospedagensPage />}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
