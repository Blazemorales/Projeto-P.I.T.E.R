# 📐 Arquitetura Completa da Integração Backend ↔ Frontend

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                         │
│                    http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          components/pages/dashboard-pesquisa.tsx        │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ 📊 3 Abas: Search | Analyze | Compare            │  │   │
│  │  │ 🎛️  Filtros: Territory | Dates | Keywords       │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                      │                                   │   │
│  │                      ↓ (Dispatch)                       │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │           useBackendAnalysis Hook                 │  │   │
│  │  │  - data, loading, error, progress                │  │   │
│  │  │  - analyze(territory, dates, keywords)           │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                      │                                   │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │        useComparisonService Hook                  │  │   │
│  │  │  - data, loading, error                           │  │   │
│  │  │  - compare(terrA, datesA, terrB, datesB)         │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                      │                                   │   │
│  │                      ↓ (Call)                           │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │    BackendIntegrationService (Singleton)          │  │   │
│  │  │  ✅ search()                                       │  │   │
│  │  │  ✅ analyze()                                      │  │   │
│  │  │  ✅ compare()                                      │  │   │
│  │  │  ✅ healthCheck()                                 │  │   │
│  │  │  ✅ loadAnalysisFromLocal()                       │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                      │                                   │   │
│  │                      ↓ (HTTP)                           │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │       localStorage & public/data/                 │  │   │
│  │  │  - Persistência local de análises                │  │   │
│  │  │  - Cache de comparações                          │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓ fetch()
              ┌──────────────────────────────────┐
              │        HTTP Bridge               │
              │   (CORS: allow_origins=["*"])   │
              └──────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│                    http://localhost:8000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              main.py (FastAPI App)                       │  │
│  │  ✅ GET /health                                         │  │
│  │  ✅ GET /api/v1/gazettes                               │  │
│  │  ✅ GET /analyze                                        │  │
│  │  ✅ GET /compare                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PiterApiOrchestrator (Serviço)                   │  │
│  │  - run_analysis_pipeline()                              │  │
│  │  - get_enriched_gazette_data()                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                  │              │              │               │
│         ┌────────┴────────┐     │     ┌────────┴────────┐     │
│         ↓                 ↓     ↓     ↓                 ↓     │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐│
│  │ Querido     │  │ SpaCy + NER         │  │ Gemini AI       ││
│  │ Diário API  │  │ (Named Entity Rec)  │  │ (Análise Qual)  ││
│  └─────────────┘  └─────────────────────┘  └─────────────────┘│
│         ↓                 ↓                        ↓            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      StatisticsGenerator (Categorização)                 │  │
│  │  - total_invested                                        │  │
│  │  - investments_by_category                              │  │
│  │  - entity_counts_by_type                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Persistência (Dupla)                           │  │
│  │  ├─ backend/data_output/*.json                          │  │
│  │  ├─ frontend/public/data/latest_search.json             │  │
│  │  └─ localStorage (Frontend)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Estrutura de Diretórios

```
Projeto-P.I.T.E.R/
│
├── frontend/
│   ├── services/
│   │   └── backend-integration.ts          ✅ Novo - Serviço centralizado
│   │       ├── search()          → GET /api/v1/gazettes
│   │       ├── analyze()         → GET /analyze
│   │       ├── compare()         → GET /compare
│   │       ├── healthCheck()     → GET /health
│   │       └── localStorage ops
│   │
│   ├── hooks/
│   │   ├── useBackendAnalysis.ts           ✅ Novo - Hook para análise
│   │   │   ├── data: AnalysisResponse
│   │   │   ├── loading: boolean
│   │   │   ├── error: string
│   │   │   ├── progress: 0-100
│   │   │   └── analyze(): Promise<AnalysisResponse>
│   │   │
│   │   ├── useComparisonService.ts         ✅ Novo - Hook para comparação
│   │   │   ├── data: ComparisonResponse
│   │   │   ├── loading: boolean
│   │   │   ├── error: string
│   │   │   └── compare(): Promise<ComparisonResponse>
│   │   │
│   │   └── useGazetteSearch.ts             ✅ Existente - Busca simples
│   │
│   ├── types/
│   │   └── index.ts                        ✅ Atualizado com tipos novos
│   │       ├── SearchResponse
│   │       ├── AnalysisResponse
│   │       ├── ComparisonResponse
│   │       ├── AnalysisData
│   │       └── ... (+ 15 tipos)
│   │
│   ├── components/
│   │   ├── pages/
│   │   │   └── dashboard-pesquisa.tsx      ✅ Atualizado com 3 abas
│   │   │       ├── Tab 1: Search
│   │   │       ├── Tab 2: Analyze
│   │   │       └── Tab 3: Compare
│   │   │
│   │   └── exemplos/
│   │       └── ExemplosIntegracao.tsx      ✅ Novo - 4 exemplos práticos
│   │
│   ├── public/
│   │   └── data/
│   │       ├── latest_search.json          ✅ Dados de busca (exemplo)
│   │       └── latest_comparison.json      ✅ Dados de comparação (exemplo)
│   │
│   ├── .env.local                          ✅ Configurado
│   │   ├── BACKEND_URL=http://localhost:8000
│   │   └── NEXT_PUBLIC_API_URL=http://localhost:8000
│   │
│   └── package.json                        ✅ Sem novas dependências
│
├── backend/
│   ├── main.py                             ✅ FastAPI com endpoints
│   │   ├── GET /health
│   │   ├── GET /api/v1/gazettes
│   │   ├── GET /analyze
│   │   └── GET /compare
│   │
│   ├── services/
│   │   └── integration/
│   │       └── piter_api_orchestrator.py
│   │
│   ├── data_output/                        ✅ Análises salvas
│   │   ├── analysis_*.json
│   │   ├── compare_*.json
│   │   └── search_*.json
│   │
│   └── requirements.txt                    ✅ Dependências
│       ├── fastapi
│       ├── uvicorn
│       ├── spacy
│       ├── google-generativeai
│       └── ... (+ 10 deps)
│
├── docker-compose.yml                      ✅ Orquestração completa
│   ├── backend service (port 8000)
│   └── frontend service (port 3000)
│
└── GUIA_INTEGRACAO_RAPIDA.md               ✅ Novo - Referência rápida
```

---

## 🔄 Fluxos de Dados

### Fluxo 1: Busca Simples
```
Dashboard (useGazetteSearch)
    ↓
BackendIntegrationService.search()
    ↓
fetch() → GET /api/v1/gazettes
    ↓
Backend: orchestrator.get_enriched_gazette_data()
    ↓
Querido Diário API
    ↓
Retorna: SearchResponse { gazettes[], total_gazettes }
    ↓
Frontend: Exibe resultados em card list
```

**Tempo:** ~1-3 segundos

---

### Fluxo 2: Análise Completa
```
Dashboard (useBackendAnalysis)
    ↓
analyze() → BackendIntegrationService.analyze()
    ↓
fetch() → GET /analyze
    ↓
Backend: run_analysis_pipeline()
    ├─ Querido Diário API (busca)
    ├─ SpaCy NER (extração de entidades)
    ├─ Categorização (investments_by_category)
    └─ Gemini AI (análise qualitativa)
    ↓
Salva: backend/data_output/search_*.json
    ↓
Retorna: AnalysisResponse {
  meta: { territory, period, keywords, timestamp },
  data: { entities, investments, qualitative }
}
    ↓
Frontend:
  ├─ Salva no localStorage
  ├─ Copia para frontend/public/data/latest_search.json
  └─ Exibe gráficos e tabelas
```

**Tempo:** ~30-120 segundos (Gemini API pode ser lenta)

---

### Fluxo 3: Comparação
```
Dashboard (useComparisonService)
    ↓
compare(terrA, terrB, ...) → BackendIntegrationService.compare()
    ↓
fetch() → GET /compare
    ↓
Backend: ComparisonService.compare_scenarios()
    ├─ Análise Territory A (via run_analysis_pipeline)
    ├─ Análise Territory B (paralelo)
    └─ Calcula diferenças e vencedor
    ↓
Salva: backend/data_output/compare_*.json
    ↓
Retorna: ComparisonResponse {
  meta: { terrA, terrB, periods },
  data: {
    territory_a_analysis,
    territory_b_analysis,
    differences: { winner, investment_diff, percentage }
  }
}
    ↓
Frontend:
  ├─ Salva no localStorage
  ├─ Exibe comparação side-by-side
  └─ Destaca vencedor
```

**Tempo:** ~60-240 segundos (2 análises em paralelo)

---

## 🎯 Tipos TypeScript Completos

### 1. SearchResponse
```typescript
interface SearchResponse {
  total_gazettes: number;
  gazettes: Gazette[];
}

interface Gazette {
  territory_id: string;
  territory_name: string;
  date: string;
  url: string;
  txt_url?: string;
  edition?: string;
  is_extra_edition?: boolean;
  excerpts?: string[];
  scraped_at?: string;
  state_code?: string;
}
```

### 2. AnalysisResponse
```typescript
interface AnalysisResponse {
  meta: AnalysisMeta;
  data: AnalysisData;
}

interface AnalysisMeta {
  source_territory: string;
  period: string;
  search_keywords: string;
  generated_at: string;
}

interface AnalysisData {
  total_entities: number;
  entity_counts_by_type: { [key: string]: number };
  top_entities: { [key: string]: { count: number; type: string } };
  total_invested: number;
  investments_by_category: { [category: string]: number };
  qualitative_analysis: QualitativeAnalysis;
}
```

### 3. ComparisonResponse
```typescript
interface ComparisonResponse {
  meta: ComparisonMeta;
  data: ComparisonData;
}

interface ComparisonData {
  territory_a_analysis: AnalysisData;
  territory_b_analysis: AnalysisData;
  differences: {
    investment_diff: number;
    investment_percentage: number;
    entities_diff: number;
    winner: string;
  };
}
```

---

## 🔐 Segurança & Performance

### CORS Configurado
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Variáveis de Ambiente
```bash
# Frontend
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (em main.py)
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### Cache & Persistência
- ✅ localStorage (Frontend - sessionStorage)
- ✅ Arquivos JSON (Backend - data_output/)
- ✅ Arquivos JSON (Frontend - public/data/)

---

## 📊 Monitoramento & Debug

### Verificar Status do Backend
```bash
# Health check
curl http://localhost:8000/health

# Response
{"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
```

### Testar Endpoints
```bash
# Busca simples
curl "http://localhost:8000/api/v1/gazettes?territory_ids=5300108&querystring=software&size=5"

# Análise
curl "http://localhost:8000/analyze?territory_id=5300108&since=2024-01-01&until=2024-01-31"

# Comparação
curl "http://localhost:8000/compare?territory_a=5300108&date_a_start=2024-01-01&date_a_end=2024-06-30&territory_b=5208707&date_b_start=2024-01-01&date_b_end=2024-06-30"
```

### Logs do Frontend (DevTools)
```javascript
// F12 → Console
console.log(localStorage.getItem('latest_search'));
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log);
```

---

## 🚀 Deploy Recomendado

### Desenvolvimento
```bash
# Terminal 1
cd backend && python3 -m uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

### Produção (Docker)
```bash
# Na raiz do projeto
docker-compose up -d
```

### Variáveis para Produção
```bash
# Backend
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=https://seu-dominio.com

# Frontend
BACKEND_URL=https://api.seu-dominio.com
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

---

## ✅ Checklist de Integração

- [x] Backend FastAPI rodando
- [x] CORS configurado
- [x] 3 endpoints ativos (/gazettes, /analyze, /compare)
- [x] Frontend Next.js rodando
- [x] Variáveis de ambiente configuradas
- [x] BackendIntegrationService implementado
- [x] Hooks customizados criados
- [x] Dashboard com 3 abas
- [x] Tipos TypeScript definidos
- [x] localStorage configurado
- [x] Exemplos de uso disponíveis
- [x] Documentação completa
- [x] Docker Compose funcional

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte `GUIA_INTEGRACAO_RAPIDA.md`
2. Verifique `frontend/components/exemplos/ExemplosIntegracao.tsx`
3. Abra DevTools (F12) e verifique Network/Console
4. Verifique logs do backend: `docker logs piter-backend`

---

**Data:** 1 de dezembro de 2025
**Versão:** P.I.T.E.R v1.3.0
**Status:** ✅ Integração Completa
