# Backend - Projeto P.I.T.E.R

**P**rocurador de **I**nvestimentos em **T**ecnologia em **E**ducação **R**egional

Guia de configuração, arquitetura e execução do ambiente de desenvolvimento local para a equipe.

- **Disciplina:** `MDS, Engenharia de Software`
- **Professora/Orientadora:** `Carla`
- **Instituição:** UnB - Universidade de Brasília

---

## 📋 Índice

- [Tecnologias](#️-tecnologias)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Pipeline de Dados](#-pipeline-de-dados)
- [Como Rodar o Projeto](#-como-rodar-o-projeto-localmente)
- [Endpoints da API](#️-endpoints-principais)
- [Histórico de Mudanças](#-histórico-de-mudanças)
- [Testes e Qualidade](#-testes-e-qualidade)
- [Referências](#-referência)

---

## 🛠️ Tecnologias

- **Linguagem:** Python 3.12
- **Framework Web:** FastAPI
- **Validação de Dados:** Pydantic
- **Servidor ASGI:** Uvicorn
- **Cliente HTTP:** HTTPX (async)
- **Análise de Dados:** Pandas
- **NLP:** spaCy (modelo `pt_core_news_sm`)
- **IA Generativa:** Google Gemini (via Google Gen AI SDK)
- **Testes:** Pytest, Pytest-Mock
- **Qualidade de Código:** Pre-commit, Black, Ruff

> ⚠️ **AVISO:** Requisito: Python **3.12** (spaCy não é compatível com Python 3.13+)

---

## 🧠 Arquitetura do Sistema

O backend segue uma **arquitetura em camadas** baseada no padrão **P.I.T.E.R** (inspirado em Clean Architecture), utilizando uma abordagem de **Inteligência Híbrida** (NLP Clássico + IA Generativa).

```mermaid
graph TD
    A[Client / Frontend] -->|HTTP Request| B(Camada de Apresentação<br>FastAPI Routes)
    B --> C{Camada de Integração<br>PiterApiOrchestrator}
    C -->|Coleta| D[Camada de Clientes API]
    C -->|Processamento| E[Camada de Processamento]
    D -->|Busca| F[Querido Diário]
    D -->|Contexto| G[Google Gemini AI]
    E -->|Limpeza| H[Data Cleaner]
    E -->|Estatísticas| I[Statistics Generator]
    E -->|NLP| J[spaCy]
````

### Princípios Arquiteturais

1.  **Inteligência Híbrida**:
      * **Quantitativo (Exatidão):** Regex e Python puro para somar valores e categorizar gastos (evita alucinação de IA).
      * **Qualitativo (Contexto):** IA Generativa (Gemini) para resumir, justificar e explicar os gastos.
2.  **Separação de Responsabilidades**: Cada serviço tem uma função única.
3.  **Orquestração Centralizada**: O `PiterApiOrchestrator` coordena o fluxo de dados.
4.  **Persistência em Arquivo**: Resultados salvos em JSON para consumo desacoplado pelo Frontend.

-----

## 📂 Estrutura de Diretórios

```
backend/
├── main.py                         # Ponto de entrada da aplicação FastAPI
├── requirements.txt                # Dependências do projeto
├── .env.example                    # Exemplo de variáveis de ambiente
│
├── services/                       # Lógica de negócio e serviços
│   │
│   ├── integration/                # 🧠 CAMADA DE INTEGRAÇÃO
│   │   ├── __init__.py
│   │   └── piter_api_orchestrator.py
│   │       ├── PiterApiOrchestrator (classe)
│   │       └── run_analysis_pipeline() (função)
│   │           • Pipeline completo: Coleta → Limpeza → IA → Estatísticas → Persistência
│   │
│   ├── api/                        # 🔌 CAMADA DE API (CLIENTES)
│   │   ├── clients/
│   │   │   ├── querido_diario_client.py   # Coleta dados oficiais
│   │   │   ├── spacy_api_client.py        # NLP (Entidades)
│   │   │   └── gemini_client.py           # IA Generativa (Resumos)
│   │
│   └── processing/                 # ⚙️ CAMADA DE PROCESSAMENTO
│       ├── data_cleaner.py            # Limpeza e Pré-filtragem (Regex)
│       └── statistics_generator.py    # Categorização Financeira (Radar de Tech)
│
└── tests/                          # 🧪 Testes automatizados
    ├── test_main_api.py               # Testes de Integração
    └── processing/                    # Testes Unitários
```

-----

## 🔄 Pipeline de Dados (`/analyze`)

Quando o endpoint de análise é chamado, o seguinte fluxo acontece:

1.  **Busca (Input):** O sistema busca no *Querido Diário* usando keywords estratégicas (ex: "robótica", "computador").
2.  **Agregação:** Baixa até 50 diários e concatena os trechos relevantes.
3.  **Pré-Filtragem:** O `DataCleaner` remove cabeçalhos, rodapés e ruído visual.
4.  **Análise Quantitativa:**
      * O `StatisticsGenerator` identifica valores monetários (R$).
      * Cruza o contexto com categorias de **Tecnologia Educacional** (Hardware, Software, Robótica).
5.  **Análise Qualitativa (IA):**
      * Se houver investimento, o texto é enviado ao **Gemini**.
      * Retorna: Resumo do Objeto, Justificativa e Fornecedor.
6.  **Persistência:** Salva o JSON em `frontend/public/data/latest_analysis.json`.

-----

## 🚀 Como Rodar o Projeto Localmente

### 1️⃣ Pré-requisitos

  - Python 3.12 instalado
  - Chave de API do Google Gemini (Obtenha no [Google AI Studio](https://aistudio.google.com/))

### 2️⃣ Instalação

```bash
# 1. Clone o projeto e entre na pasta principal
git clone [https://github.com/unb-mds/Projeto-P.I.T.E.R.git](https://github.com/unb-mds/Projeto-P.I.T.E.R.git)
cd Projeto-P.I.T.E.R

# 2. (Opcional) Troque para a branch de desenvolvimento
git checkout enviodadosapi

# 3. Crie e ative o ambiente virtual (na raiz do projeto)
python3 -m venv venv  # Ou 'py -3.12 -m venv venv' no Windows

# Ativar no Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Ativar no Linux/Mac:
# source venv/bin/activate

# 4. Instale as dependências (apontando para a pasta backend)
pip install -r backend/requirements.txt

# 5. Instale o modelo do spaCy (Link direto para evitar erros 404)
pip install [https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz](https://github.com/explosion/spacy-models/releases/download/pt_core_news_sm-3.7.0/pt_core_news_sm-3.7.0.tar.gz)
```

### 3️⃣ Configuração de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/` com suas chaves:

```bash
# backend/.env
GEMINI_API_KEY="sua_chave_AIzaSy_aqui..."
```

### 4️⃣ Execução do Servidor

**IMPORTANTE:** Rodar sempre a partir da **raiz do projeto**, usando o modo de módulo (`-m`).

```bash
# Inicie o servidor (estando na pasta raiz Projeto-P.I.T.E.R)
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse a documentação interativa em: **http://127.0.0.1:8000/docs**

-----

## 📡 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/analyze` | **Pipeline Principal.** Dispara coleta, IA e atualiza o frontend. |
| `GET` | `/api/v1/gazettes` | Busca simples de diários (sem análise profunda). |
| `GET` | `/health` | Healthcheck básico. |

### Exemplo de Uso (Radar de Robótica)

Para analisar investimentos em robótica em Brasília (padrão):

```bash
GET [http://127.0.0.1:8000/analyze?keywords=robótica](http://127.0.0.1:8000/analyze?keywords=robótica)
```

**Resposta (JSON gerado):**

```json
{
  "data": {
    "total_invested": 150000.00,
    "investments_by_category": {
      "Robótica & Maker": 150000.00
    },
    "qualitative_analysis": {
      "resumo_objeto": "Aquisição de laboratórios móveis de robótica.",
      "fornecedor": "TechEduca LTDA"
    }
  }
}
```

-----

## 🧪 Testes e Qualidade

### 1\. Executar Testes

Os testes devem ser executados a partir da pasta `backend`.

```bash
cd backend
pytest -s -v
```

Isso executará:

  * **Testes de Integração:** Verificam se a API responde e se conecta (com mocks).
  * **Testes Unitários:** Verificam a lógica de limpeza de dados e cálculo financeiro.

### 2\. Qualidade de Código (Pre-commit)

```bash
# Instalar hooks (na raiz)
pre-commit install
```

Isso garante que todo commit seja verificado pelo **Black** (formatação) e **Ruff** (linting)

-----

## 📜 Histórico de Mudanças Relevantes

### v1.3.1 - 19 Novembro 2025

#### **Correções de CI/CD e Estabilidade**

  * **CI/CD:** Atualização do workflow de integração contínua para Python 3.12
  * **Dependências:** Correção de versões pinadas (spacy 3.7.6, google-generativeai 0.8.5)
  * **Testes:** Adição de pytest-asyncio e correção de testes falhando
  * **Statistics Generator:** Correção do retorno de `total_entities` nas estatísticas
  * **Build:** Resolução de problemas de build causados por versões yanked do PyPI

### v1.3.0 - Novembro 2025

#### **Implementação de Inteligência Híbrida**

  * **IA Generativa:** Integração com Google Gemini para análise qualitativa.
  * **Radar de Tecnologia:** Novos filtros para detectar Hardware, Software e Robótica.
  * **Persistência:** Geração automática de arquivos JSON para o Frontend.
  * **Correção de Coleta:** Ajuste no cliente HTTP para seguir redirecionamentos da API oficial.

-----

**Desenvolvido com ☕ e 🤖 pela equipe do Projeto P.I.T.E.R - UnB/FGA**

```
