# Atlantis — Sistema Hoteleiro

SPA (Single Page Application) desenvolvida em React + TypeScript como interface gráfica do sistema Atlantis, substituindo a interface CLI anterior. O projeto é parte da disciplina de Técnicas de Programação II.

---

## Funcionalidades

- **Dashboard** — visão geral com estatísticas e atividade recente
- **Hóspedes** — cadastro, edição, visualização e remoção de clientes (CRUD completo), incluindo endereço, telefones e documentos
- **Acomodações** — catálogo com os 6 tipos de acomodação pré-definidos pelo sistema
- **Hospedagens** — registro de check-in, encerramento de check-out e histórico completo
- **Persistência local** — dados salvos automaticamente no `localStorage` do navegador

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm (já incluso no Node)

### Instalação e execução

```bash
# Clone o repositório

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Build para produção

```bash
npm run build
```

Os arquivos finais ficam na pasta `dist/`.

---

## Persistência de dados

Os dados de clientes e hospedagens são salvos automaticamente no `localStorage` do navegador a cada alteração, sob as chaves:

- `atlantis:clientes`
- `atlantis:hospedagens`

Os dados persistem entre sessões no mesmo navegador. Para limpar tudo, abra o DevTools → Application → Local Storage e remova as chaves acima.

---

## Autor

Desenvolvido como atividade prática (AV4) — Técnicas de Programação II  
