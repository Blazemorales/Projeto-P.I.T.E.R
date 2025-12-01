# ⚡ Quick Reference - Integração Backend ↔ Frontend

**P.I.T.E.R v1.3.0** | Criado: 1 de dezembro de 2025

---

## 🚀 Início (30 segundos)

```bash
# Terminal 1
cd backend && python3 -m uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev

# Abrir navegador
http://localhost:3000
```

---

## 📦 Arquivos Principais

| Arquivo | Função | Status |
|---------|--------|--------|
| `frontend/services/backend-integration.ts` | Serviço API | ✅ NOVO |
| `frontend/hooks/useBackendAnalysis.ts` | Hook análise | ✅ NOVO |
| `frontend/hooks/useComparisonService.ts` | Hook comparação | ✅ NOVO |
| `frontend/types/index.ts` | Tipos TS | ✅ ATUALIZADO |
| `frontend/components/pages/dashboard-pesquisa.tsx` | Dashboard | ✅ ATUALIZADO |
| `frontend/.env.local` | Env vars | ✅ CONFIGURADO |
| `backend/main.py` | FastAPI | ✅ FUNCIONAL |

---

## 🎯 3 Fluxos Principais

### 1️⃣ Busca Simples
```typescript
import BackendIntegrationService from '@/services/backend-integration';

const results = await BackendIntegrationService.search(
  '5300108',      // Territory ID
  'software',     // Query
  '2024-01-01',   // Since
  '2024-12-31'    // Until
);
// results.gazettes → Array de diários
```

### 2️⃣ Análise com IA
```typescript
import useBackendAnalysis from '@/hooks/useBackendAnalysis';

const { data, loading, analyze } = useBackendAnalysis();

await analyze(
  '5300108',      // Territory
  '2024-01-01',   // Since
  '2024-12-31',   // Until
  'software'      // Keywords
);
// data.data.total_invested → Valor investido
```

### 3️⃣ Comparação
```typescript
import useComparisonService from '@/hooks/useComparisonService';

const { data, compare } = useComparisonService();

await compare(
  '5300108', '2024-01-01', '2024-06-30',  // Territory A
  '5208707', '2024-01-01', '2024-06-30'   // Territory B
);
// data.data.differences.winner → Vencedor
```

---

## 🔗 Endpoints do Backend

| Método | URL | Query Params | Tempo |
|--------|-----|--------------|-------|
| `GET` | `/health` | - | 1s |
| `GET` | `/api/v1/gazettes` | `territory_ids`, `querystring`, `size`, `published_since`, `published_until` | 1-3s |
| `GET` | `/analyze` | `territory_id`, `since`, `until`, `keywords` | 30-120s |
| `GET` | `/compare` | `territory_a`, `territory_b`, `date_*` | 60-240s |

---

## 📍 IDs de Territórios

```
5300108  → Brasília (DF)
5208707  → Goiânia (GO)
5201405  → Aparecida de Goiânia (GO)
```

---

## 💾 Estrutura de Dados

### SearchResponse
```json
{
  "total_gazettes": 50,
  "gazettes": [
    {
      "territory_id": "5300108",
      "territory_name": "Brasília",
      "date": "2024-01-15",
      "url": "https://...",
      "edition": "1234"
    }
  ]
}
```

### AnalysisResponse
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
    "total_invested": 695556.13,
    "investments_by_category": {
      "Software": 450000,
      "Robótica": 180000
    }
  }
}
```

### ComparisonResponse
```json
{
  "data": {
    "territory_a_analysis": { ... },
    "territory_b_analysis": { ... },
    "differences": {
      "investment_diff": 100000,
      "investment_percentage": 15.5,
      "winner": "Brasília"
    }
  }
}
```

---

## 🛠️ Usar no Componente

### Opção 1: Serviço Direto
```typescript
'use client';

import BackendIntegrationService from '@/services/backend-integration';

export default function MyComponent() {
  const handleClick = async () => {
    const data = await BackendIntegrationService.analyze(
      '5300108', '2024-01-01', '2024-12-31'
    );
    console.log(data.data.total_invested);
  };

  return <button onClick={handleClick}>Analisar</button>;
}
```

### Opção 2: Com Hook
```typescript
'use client';

import useBackendAnalysis from '@/hooks/useBackendAnalysis';

export default function MyComponent() {
  const { data, loading, error, analyze } = useBackendAnalysis();

  return (
    <div>
      <button onClick={() => analyze('5300108', '2024-01-01', '2024-12-31')}>
        {loading ? 'Analisando...' : 'Analisar'}
      </button>
      {data && <p>Total: {data.data.total_invested}</p>}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

---

## 🧪 Testar via Curl

```bash
# Health check
curl http://localhost:8000/health

# Busca
curl "http://localhost:8000/api/v1/gazettes?territory_ids=5300108&querystring=software&size=5"

# Análise
curl "http://localhost:8000/analyze?territory_id=5300108&since=2024-01-01&until=2024-01-31"

# Comparação
curl "http://localhost:8000/compare?territory_a=5300108&date_a_start=2024-01-01&date_a_end=2024-06-30&territory_b=5208707&date_b_start=2024-01-01&date_b_end=2024-06-30"
```

---

## 🧪 Testar via Browser

```javascript
// Abrir DevTools (F12) → Console e rodar:

// 1. Health check
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)

// 2. Busca
fetch('http://localhost:8000/api/v1/gazettes?territory_ids=5300108&querystring=software')
  .then(r => r.json())
  .then(console.log)

// 3. Análise
fetch('http://localhost:8000/analyze?territory_id=5300108&since=2024-01-01&until=2024-01-31')
  .then(r => r.json())
  .then(console.log)
```

---

## ⚙️ Configuração

### .env.local
```bash
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### CORS (backend/main.py)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Debug

### Ver Logs
```bash
# Backend
docker-compose logs backend -f

# Frontend
tail -f logs/next.log  # Se configurado
```

### DevTools
- **F12** → Network: Ver requisições HTTP
- **F12** → Console: Executar JS
- **F12** → Storage: Ver localStorage

### Verificar Status
```bash
# Backend online?
curl -I http://localhost:8000/health

# Frontend online?
curl -I http://localhost:3000
```

---

## 📚 Documentação Completa

| Documento | Conteúdo |
|-----------|----------|
| **GUIA_INTEGRACAO_RAPIDA.md** | Guia prático em 5 minutos |
| **ARQUITETURA_INTEGRACAO.md** | Arquitetura detalhada |
| **RESUMO_IMPLEMENTACAO.md** | O que foi criado |
| **TROUBLESHOOTING.md** | Resolver problemas |
| **ExemplosIntegracao.tsx** | 4 exemplos práticos |

---

## 💡 Dicas Rápidas

- ✅ Ambos os servidores devem estar rodando
- ✅ `'use client'` no topo do componente (requisito Next.js)
- ✅ localStorage só funciona no cliente
- ✅ Análise é lenta (30-120s) → Normal!
- ✅ Use DevTools para debug
- ✅ Verificar variáveis de ambiente
- ✅ Usar IDs IBGE válidos

---

## ❌ Erros Comuns

| Erro | Solução |
|------|---------|
| CORS error | Backend CORS não configurado |
| 404 Not Found | Endpoint não existe ou URL errada |
| Connection refused | Backend não está rodando |
| undefined API URL | Variáveis de ambiente não carregadas |
| Cannot find module | Arquivo não existe ou import errado |
| localStorage undefined | Componente não é client (falta `'use client'`) |

---

## 🎯 Próximos Passos

1. **Executar** `npm run dev` e `uvicorn main:app --reload`
2. **Acessar** http://localhost:3000
3. **Testar** cada aba (Search, Analyze, Compare)
4. **Consultar** documentação conforme necessário
5. **Integrar** em seus componentes usando hooks

---

## 📞 Referência Rápida

```typescript
// IMPORT
import BackendIntegrationService from '@/services/backend-integration';
import useBackendAnalysis from '@/hooks/useBackendAnalysis';
import useComparisonService from '@/hooks/useComparisonService';
import { AnalysisResponse, ComparisonResponse } from '@/types';

// USAR SERVIÇO
BackendIntegrationService.search(id, query, since, until);
BackendIntegrationService.analyze(id, since, until, keywords);
BackendIntegrationService.compare(idA, dateAStart, dateAEnd, idB, dateBStart, dateBEnd);
BackendIntegrationService.healthCheck();

// USAR HOOKS
const { data, loading, error, analyze } = useBackendAnalysis();
const { data, loading, error, compare } = useComparisonService();

// TESTAR
curl http://localhost:8000/health
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log)
```

---

**Criado:** 1 de dezembro de 2025  
**Versão:** P.I.T.E.R v1.3.0  
**Status:** ✅ **PRONTO PARA USO**
