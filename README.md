# CELERIS

> 🌐 **Acesse o projeto:** https://sofiamassaro.github.io/celeris/
> 🔧 **Backend (API):** [github.com/sofiamassaro/celeris-api](https://github.com/sofiamassaro/celeris-api)

## Redefinindo o Tempo da Justiça através da Triagem Automatizada

O **Celeris** é um ecossistema de triagem inteligente desenvolvido para o Judiciário brasileiro. O projeto atua na porta de entrada dos Tribunais, utilizando tecnologia para analisar e classificar automaticamente petições iniciais antes mesmo da leitura humana.

O nome tem origem no latim *celeritas* (rapidez, prontidão) e remete diretamente ao **Princípio da Celeridade Processual**, garantido pela Constituição Federal, que busca assegurar a todos a razoável duração do processo.

---

## O Problema

O Judiciário brasileiro enfrenta um estoque de milhões de processos acumulados. Atualmente, servidores precisam ler manualmente centenas de petições diariamente para decidir o destino de cada processo. Este fluxo manual gera:

- **Cansaço extremo** dos servidores
- **Erros humanos** na triagem
- **Lentidão sistêmica** no atendimento ao cidadão

---

## A Solução

A inovação do Celeris está na categorização prévia das demandas. Ao receber os processos já identificados e separados por assunto, o trabalho do servidor é drasticamente acelerado.

- **Triagem Inteligente:** Análise automática de petições para classificação imediata do assunto jurídico
- **Filtro de Repetitivos:** Identificação de processos idênticos (litispendência) e demandas em massa
- **Automação de Fluxo:** Sugestão de modelos de despachos padronizados para acelerar a tramitação inicial

---

## Proposta de Valor

- **Mais tempo para decidir, menos tempo para triar:** redução drástica do gargalo inicial de entrada de processos
- **Inteligência Pronta para a Decisão:** o servidor não perde tempo descobrindo o assunto, ele já inicia o trabalho na fase de resolução
- **Conformidade Constitucional:** ferramenta que eleva o padrão de atendimento ao cidadão através da tecnologia

---

## Público-Alvo

- **Público Direto:** servidores públicos, assessores jurídicos, estagiários e magistrados
- **Foco:** Tribunais de Justiça Estaduais com alto volume de processos repetitivos

---

## Arquitetura do Sistema

O Celeris é dividido em duas partes que se comunicam via HTTP:

O frontend é construído inteiramente com tecnologias **nativas do navegador** (HTML, CSS e JavaScript com ES Modules), sem nenhum framework ou bundler. Toda a persistência de dados acontece via API REST, garantindo que processos cadastrados sobrevivam ao recarregamento da página e fiquem disponíveis para múltiplos usuários.

---

## Estrutura de Pastas

```
CELERIS/
├── index.html              → shell da aplicação (estrutura mínima)
├── app.js                  → ponto de entrada, orquestra inicialização
├── css/
│   └── style.css           → estilos globais com variáveis CSS
├── data/
│   └── processos.js        → camada de comunicação com a API
├── utils/
│   ├── dom.js              → seletores e helpers do DOM
│   └── loadViews.js        → carregador dinâmico de fragments HTML
├── components/
│   ├── sidebar.html        → menu lateral
│   └── ai-panel.html       → painel lateral de IA
└── views/
    ├── upload.html / .js   → tela de upload de PDF
    ├── fila.html           → fila de triagem (renderizada via JS)
    ├── documento.html / .js → visualização da petição
    ├── cadastro.html / .js  → formulário de cadastro
    ├── confirmacao.html    → tela de revisão antes do envio
    ├── generica.html / .js → telas em desenvolvimento
    └── upload.js
```

### Princípios de organização

- **`data/`** é a única camada que se comunica com a API
- **`utils/`** contém helpers reutilizáveis (DOM, carregamento)
- **`views/`** segue o padrão: cada tela tem um arquivo HTML (estrutura) e um JS (comportamento)
- **`components/`** guarda HTML reutilizável entre múltiplas views

---

## Fluxo do Usuário

1. **Upload PDF** — servidor envia a petição em PDF para análise
2. **Cadastro** — sistema pré-preenche o formulário com dados extraídos do PDF
3. **Triagem** — petição entra na fila já classificada por assunto
4. **Análise** — servidor abre o processo e vê sugestões de despacho
5. **Concluído** — processo encaminhado ao próximo estágio

A barra de workflow no topo do app indica visualmente em qual etapa o usuário está.

---

## Como rodar localmente

### Pré-requisitos

- Um navegador moderno (Chrome, Firefox, Edge)
- Extensão **Live Server** do VS Code (ou similar)
- Backend **celeris-api** rodando em `http://localhost:3000`

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/sofiamassaro/CELERIS.git
cd CELERIS

# 2. Antes de tudo, subir o backend
# Em outra pasta, seguir as instruções de:
# https://github.com/sofiamassaro/celeris-api

# 3. Abrir o projeto no VS Code
code .

# 4. Clicar com botão direito em index.html
#    → "Open with Live Server"
```

O frontend abre automaticamente em `http://localhost:5500` (ou similar) e já busca os dados da API em `http://localhost:3000`.

> **Importante:** o frontend precisa do backend rodando para funcionar. Sem a API ativa, a fila não carrega nenhum processo.

---

## Autoria

**Sofia Massaro**

---

## Licença

MIT
