# 🚀 Guia Rápido - Integração Backend ↔ Frontend

## ⚡ Início Rápido (5 minutos)

### Terminal 1: Backend
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Acessar
```
Frontend: http://localhost:3000
Backend: http://localhost:8000
```

---

## 📁 Estrutura de Integração Criada

```
frontend/
├── services/
│   └── backend-integration.ts          ✅ Novo serviço centralizado
├── hooks/
│   ├── useBackendAnalysis.ts           ✅ Novo hook para análise
│   ├── useComparisonService.ts         ✅ Novo hook para comparação
│   └── useGazetteSearch.ts             ✅ Existente (busca simples)
├── types/
│   └── index.ts                        ✅ Tipos atualizados
├── components/pages/
│   └── dashboard-pesquisa.tsx          ✅ Componente atualizado
└── public/data/
    └── latest_search.json              ✅ Dados de exemplo

backend/
├── main.py                              ✅ FastAPI configurado
└── data_output/
    └── *.json                           ✅ Arquivos de análise
```

---

## 🔗 Fluxos de Integração Implementados

### 1️⃣ **FLUXO: Busca Simples**
```typescript
// frontend/components/pages/dashboard-pesquisa.tsx
const handleSearch = async () => {
  const response = await BackendIntegrationService.search(
    territorio,
    palavraChave,
    dataInicio,
    dataFim
  );
  // response.gazettes contém os diários
};
```

**Endpoint:** `GET /api/v1/gazettes?territory_ids=5300108&querystring=software`

**O que faz:**
- Busca diários na Querido Diário API
- Retorna HTML puro (rápido)
- Não salva arquivos

---

### 2️⃣ **FLUXO: Análise Completa com IA**
```typescript
// frontend/components/pages/dashboard-pesquisa.tsx
const handleAnalyze = async () => {
  const result = await analyze(
    territorio,
    dataInicio,
    dataFim,
    palavraChave
  );
  // result.data contém análise completa
};
```

**Endpoint:** `GET /analyze?territory_id=5300108&since=2024-01-01&until=2024-12-31`

**O que faz:**
- Pipeline NLP: Busca + NER (Named Entity Recognition)
- Gemini AI: Análise qualitativa
- Categoriza investimentos
- Salva em `frontend/public/data/latest_search.json`

**Resposta:**
```json
{
  "meta": {
    "source_territory": "5300108",
    "period": "2024-01-01 a 2024-12-31",
    "search_keywords": "software",
    "generated_at": "2025-12-01T13:49:58"
  },
  "data": {
    "total_entities": 103,
    "entity_counts_by_type": { "MISC": 40, "LOC": 31, ... },
    "top_entities": { "Microsoft": { "count": 15, "type": "ORG" }, ... },
    "total_invested": 695556.13,
    "investments_by_category": { "Software": 450000, ... },
    "qualitative_analysis": { "resumo_objeto": "...", ... }
  }
}
```

---

### 3️⃣ **FLUXO: Comparação entre Territórios**
```typescript
// frontend/components/pages/dashboard-pesquisa.tsx
const handleCompare = async () => {
  const result = await compare(
    territoryA,      // 5300108
    dateAStart,      // 2024-01-01
    dateAEnd,        // 2024-06-30
    territoryB,      // 5208707
    dateBStart,      // 2024-01-01
    dateBEnd         // 2024-06-30
  );
  // result.data.differences.winner mostra o vencedor
};
```

**Endpoint:** `GET /compare?territory_a=5300108&date_a_start=2024-01-01&...`

**O que faz:**
- Executa 2 análises completas em paralelo
- Calcula diferença de investimentos
- Determina vencedor
- Retorna comparação completa

---

## 📊 Estrutura de Tipos TypeScript

### Busca (`SearchResponse`)
```typescript
{
  total_gazettes: number;
  gazettes: Gazette[];  // Array de diários
}
```

### Análise (`AnalysisResponse`)
```typescript
{
  meta: AnalysisMeta;        // Metadados da análise
  data: AnalysisData;        // Dados processados
}
```

### Comparação (`ComparisonResponse`)
```typescript
{
  meta: ComparisonMeta;      // Metadados
  data: {
    territory_a_analysis: AnalysisData;
    territory_b_analysis: AnalysisData;
    differences: {
      investment_diff: number;
      investment_percentage: number;
      winner: string;
    };
  };
}
```

---

## 🎯 Como Usar os Serviços

### Opção 1: Usar o BackendIntegrationService Diretamente
```typescript
import BackendIntegrationService from '@/services/backend-integration';

// Busca
const search = await BackendIntegrationService.search('5300108', 'software');

// Análise
const analysis = await BackendIntegrationService.analyze('5300108', '2024-01-01', '2024-12-31');

// Comparação
const comparison = await BackendIntegrationService.compare(
  '5300108', '2024-01-01', '2024-06-30',
  '5208707', '2024-01-01', '2024-06-30'
);

// Verificar saúde
const online = await BackendIntegrationService.healthCheck();
```

### Opção 2: Usar os Hooks Customizados
```typescript
'use client';

import useBackendAnalysis from '@/hooks/useBackendAnalysis';
import useComparisonService from '@/hooks/useComparisonService';

export default function MyComponent() {
  const { data, loading, error, analyze } = useBackendAnalysis();
  const { data: comparison, compare } = useComparisonService();

  const handleAnalysis = async () => {
    await analyze('5300108', '2024-01-01', '2024-12-31', 'software');
  };

  return (
    <div>
      {loading && <p>Analisando...</p>}
      {error && <p>Erro: {error}</p>}
      {data && <p>Total investido: {data.data.total_invested}</p>}
      <button onClick={handleAnalysis}>Analisar</button>
    </div>
  );
}
```

---

## 🧪 Testar a Integração

### 1. Verificar Backend Online
```bash
curl http://localhost:8000/health
# Resposta: {"status":"healthy","timestamp":"..."}
```

### 2. Testar Busca Simples
```bash
curl "http://localhost:8000/api/v1/gazettes?territory_ids=5300108&querystring=software&size=5"
```

### 3. Testar Análise Completa
```bash
curl "http://localhost:8000/analyze?territory_id=5300108&since=2024-01-01&until=2024-01-31&keywords=software"
```

### 4. Testar Comparação
```bash
curl "http://localhost:8000/compare?territory_a=5300108&date_a_start=2024-01-01&date_a_end=2024-06-30&territory_b=5208707&date_b_start=2024-01-01&date_b_end=2024-06-30"
```

### 5. Testar no Navegador
```javascript
// Abrir DevTools (F12) → Console e executar:
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log)
```

---

## ⚙️ Variáveis de Ambiente

### Frontend (.env.local)
```bash
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (main.py)
```python
CORS habilitado para todos os origins
allow_origins=["*"]
```

---

## 📍 IDs de Territórios Disponíveis

| Município | ID IBGE | UF |
|-----------|---------|-----|
| Brasília | 5300108 | DF |
| Goiânia | 5208707 | GO |
| Aparecida de Goiânia | 5201405 | GO |

---

## ❌ Troubleshooting

### Erro: CORS Policy
```
Access to fetch at 'http://localhost:8000' from 'http://localhost:3000' blocked
```
**Solução:** CORS já está configurado em `backend/main.py`

### Erro: Connection Refused
```
Failed to connect to localhost:8000
```
**Solução:**
1. Verifique se backend está rodando: `ps aux | grep uvicorn`
2. Inicie: `cd backend && python3 -m uvicorn main:app --reload`

### Erro: 404 Not Found
```
GET /analyze 404
```
**Solução:** Verifique a URL e parâmetros no DevTools

### Análise Lenta (> 2 minutos)
**Normal!** O pipeline executa:
1. ✅ Busca (Querido Diário API)
2. ✅ NER (SpaCy)
3. ✅ Categorização
4. ✅ Gemini AI (pode ser lento)

---

## 📚 Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `frontend/services/backend-integration.ts` | Comunicação com API |
| `frontend/hooks/useBackendAnalysis.ts` | Hook para análise |
| `frontend/hooks/useComparisonService.ts` | Hook para comparação |
| `frontend/types/index.ts` | Tipos TypeScript |
| `backend/main.py` | Endpoints FastAPI |
| `docker-compose.yml` | Orquestração Docker |

---

## 🎓 Próximos Passos

1. ✅ Testar cada fluxo no navegador
2. ✅ Visualizar dados em gráficos (charts)
3. ✅ Exportar relatórios em PDF
4. ✅ Adicionar mais territórios
5. ✅ Implementar cache

---

## 📞 Suporte

Para erros ou dúvidas:
1. Verifique os logs do backend: `tail -f backend/logs/*.log`
2. Abra DevTools (F12) e verifique Network/Console
3. Consulte documentação completa em `GUIA_IMPLEMENTACAO_INTEGRACAO_B.md`

---

**Última atualização:** 1 de dezembro de 2025
**Status:** ✅ Integração Completa e Funcional
