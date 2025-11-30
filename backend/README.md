# Backend - Projeto P.I.T.E.R

**P**rocurador de **I**nvestimentos em **T**ecnologia em **E**ducação **R**egional

Este é o motor de inteligência do projeto, responsável por minerar Diários Oficiais, processar linguagem natural e gerar análises quantitativas e qualitativas sobre investimentos públicos em tecnologia.

- **Disciplina:** `MDS, Engenharia de Software`
- **Professora/Orientadora:** `Carla`
- **Instituição:** UnB - Universidade de Brasília

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura de Inteligência](#-arquitetura-de-inteligência)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Persistência de Dados](#-persistência-de-dados)
- [Como Rodar o Projeto](#-como-rodar-o-projeto-localmente)
- [Endpoints da API](#-endpoints-da-api)
- [Testes e Qualidade](#-testes-e-qualidade)
- [Histórico de Mudanças](#-histórico-de-mudanças)
- [Troubleshooting](#-troubleshooting)
- [Contribuidores](#-contribuidores)
- [Licença](#-licença)

---

## 🛠️ Tecnologias

- **Linguagem:** Python 3.12
- **Framework Web:** FastAPI
- **Validação:** Pydantic
- **Servidor:** Uvicorn
- **Cliente HTTP:** HTTPX (async)
- **Análise de Dados:** Pandas & Regex
- **NLP (Entidades):** spaCy (Modelo: `pt_core_news_sm`)
- **IA Generativa (Qualitativo):** Google Gemini (`gemini-2.5-flash` ou superior)
- **Testes:** Pytest, Pytest-Mock
- **Qualidade:** Pre-commit, Black, Ruff

> ⚠️ **Requisito:** Python **3.12** é obrigatório (spaCy tem limitações com 3.13+).

---

## 🧠 Arquitetura de Inteligência

O P.I.T.E.R utiliza uma abordagem de **Inteligência Híbrida** para garantir precisão nos números e contexto na explicação:

1.  **Camada Quantitativa (Exatidão):**
    * Utiliza **Regex** e **Python Puro** para extrair valores monetários (R$) e categorizá-los em tópicos de EdTech (ex: "Hardware", "Robótica", "Conectividade").
    * *Vantagem:* Elimina o risco de "alucinações" matemáticas comuns em LLMs, garantindo que R$ 1.000.000,00 seja sempre lido corretamente.

2.  **Camada Qualitativa (Contexto):**
    * Utiliza **Google Gemini** para ler o texto completo da licitação e gerar um resumo humano.
    * *Saída:* Resumo do objeto ("Compra de 200 notebooks"), justificativa ("Modernização de laboratórios") e identificação do fornecedor.

3.  **Coleta Inteligente:**
    * O robô utiliza uma estratégia de "Scan" (paginação profunda) combinada com filtros manuais de data no backend para garantir que os dados recuperados do *Querido Diário* correspondam exatamente ao período de análise, contornando limitações de relevância da API externa.

---

## 📂 Estrutura de Diretórios

```text
backend/
├── main.py                         # Rotas da API (Entrypoint)
├── requirements.txt                # Dependências
├── .env                            # Chaves de API (Gemini, etc)
│
├── services/                       # Lógica de Negócio
│   ├── integration/
│   │   └── piter_api_orchestrator.py  # 🧠 CÉREBRO: Coordena todo o fluxo
│   ├── api/
│   │   ├── clients/                # Clientes Externos
│   │   │   ├── querido_diario_client.py   # Coleta (com filtro manual de datas)
│   │   │   ├── spacy_api_client.py        # NLP Local
│   │   │   └── gemini_client.py           # IA Generativa (Agente Qualitativo)
│   │   └── comparison/
│   │       └── comparison_service.py      # Lógica de Comparação (A vs B)
│   └── processing/
│       ├── data_cleaner.py            # Limpeza (Regex de ruído)
│       └── statistics_generator.py    # Estatísticas e Categorização Financeira
│
└── data_output/                       # Histórico local de JSONs gerados
````

-----

## 💾 Persistência de Dados

O backend não utiliza banco de dados relacional no MVP. Ele gera arquivos **JSON estáticos** diretamente na pasta pública do Frontend, permitindo consumo imediato pela interface.

| Recurso | Arquivo Gerado (Frontend) | Descrição |
| :--- | :--- | :--- |
| **Pesquisa** | `frontend/public/data/latest_search.json` | Dados da última busca individual (`/analyze`). |
| **Comparação** | `frontend/public/data/latest_comparison.json` | Dados da última comparação (`/compare`). |
| **Histórico** | `backend/data_output/` | Cópia de segurança de todas as análises com timestamp. |

-----

## 🚀 Como Rodar o Projeto Localmente

### 1\. Instalação

```bash
# 1. Clone e entre na pasta do backend
git clone [https://github.com/unb-mds/Projeto-P.I.T.E.R.git](https://github.com/unb-mds/Projeto-P.I.T.E.R.git)
cd Projeto-P.I.T.E.R
cd backend

# 2. Crie e ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate  # (Linux/Mac)
# .\venv\Scripts\Activate.ps1 # (Windows)

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Instale o modelo do spaCy (Link direto para evitar erro 404)
pip install [https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz](https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz)
```

### 2\. Configuração (.env)

Crie um arquivo `.env` dentro da pasta `backend/` com sua chave do Google Gemini (necessária para a análise qualitativa):

```ini
GEMINI_API_KEY="sua_chave_AIzaSy_aqui..."
```

### 3\. Execução

**IMPORTANTE:** Execute sempre a partir da **raiz do projeto** para garantir que os imports funcionem corretamente.

```bash
# Volte para a raiz do projeto
cd ..

# Execute o servidor
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

-----

## 📡 Endpoints da API

Acesse a documentação interativa em: **http://127.0.0.1:8000/docs**

### 1\. Radar de Pesquisa (`GET /analyze`)

Analisa um período específico em busca de investimentos.

  * **URL:** `http://127.0.0.1:8000/analyze`
  * **Parâmetros:**
      * `keywords`: (Opcional) Termo de busca (ex: "robótica", "notebook").
      * `since` / `until`: Período (YYYY-MM-DD).
  * **Efeito:** Gera o arquivo `latest_search.json` e atualiza o dashboard.

### 2\. Comparador (`GET /compare`)

Compara dois cenários (ex: Jan vs Fev) para ver quem investiu mais.

  * **URL:** `http://127.0.0.1:8000/compare`
  * **Parâmetros:** `territory_a`, `date_a_start`, `date_a_end` vs `territory_b`, ...
  * **Efeito:** Gera o arquivo `latest_comparison.json` com vencedor e diferença.

-----

## 🧪 Testes e Qualidade

### Executando Testes

Os testes cobrem a coleta, limpeza, cálculo financeiro e a rota de análise.

```bash
# Entre na pasta backend
cd backend

# Execute o Pytest
pytest -s -v
```

### Cobertura Atual

  * ✅ **Unitários:** Limpeza de dados (Regex) e Gerador de Estatísticas.
  * ✅ **Integração:** Endpoint `/analyze` (Sucesso, Falha de API, Texto Vazio).
  * ⚠️ **Comparação:** A rota `/compare` foi validada manualmente.

### Qualidade de Código (Pre-commit)

```bash
# Instalar hooks (na raiz)
pre-commit install
```

Isso garante que todo commit seja verificado pelo **Black** (formatação) e **Ruff** (linting).

-----

## 📜 Histórico de Mudanças

### v1.3.0 - Novembro 2025 (Atual)

  * **Inteligência Híbrida:** Integração total com Google Gemini e spaCy.
  * **Radar de EdTech:** Filtros específicos para Hardware, Software e Robótica.
  * **Correção de Dados:** Implementação de filtro manual de datas e exclusão de falsos positivos (folha de pagamento).
  * **Persistência:** Sistema de arquivos JSON para comunicação com Frontend.
  * **Comparação:** Novo endpoint para duelo de cenários.

### v1.2.0 - Novembro 2025

  * **Keywords:** Implementação de suporte a busca por palavras-chave.

### v1.1.0 - Novembro 2025

  * **Ranking:** Implementação inicial do sistema de ranking.

-----

## 🔧 Troubleshooting

### Erro: `ModuleNotFoundError: No module named 'backend'`

**Solução:** Você está rodando o comando de dentro da pasta `backend`. Volte para a raiz (`cd ..`) e rode `python -m uvicorn backend.main:app ...`.

### Erro: `spaCy model not found` (Erro 404)

**Solução:** O comando automático pode falhar. Instale via link direto:
`pip install https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz`

### Erro: `GEMINI_API_KEY não encontrada`

**Solução:** Verifique se o arquivo `.env` está na pasta `backend/` e se o código `gemini_client.py` está carregando o caminho correto com `dotenv`.

-----

## 👥 Contribuidores

  - **Ana** - Implementação de keywords e otimização de busca
  - **Gulia** - Sistema de ranking e integração com APIs
  - **Morais** - Pipeline de análise e processamento de dados
  - **Rodrigo** - Estatísticas e geração de métricas
  - **Equipe P.I.T.E.R** - Desenvolvimento contínuo

-----

## 📄 Licença

Este projeto está sob a licença definida no arquivo LICENSE na raiz do repositório.

**Desenvolvido com ☕ e 🤖 pela equipe do Projeto P.I.T.E.R - UnB/FGA**
