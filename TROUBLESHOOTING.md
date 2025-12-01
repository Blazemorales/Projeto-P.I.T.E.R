# 🔧 Troubleshooting - Integração Backend ↔ Frontend

**Data:** 1 de dezembro de 2025  
**Versão:** P.I.T.E.R v1.3.0

---

## ❌ Problemas Comuns e Soluções

### 1. Backend Offline

#### Sintoma
```
Failed to connect to localhost:8000
Connection refused
```

#### Soluções

**Verificar se está rodando:**
```bash
curl http://localhost:8000/health
```

**Se retornar erro, iniciar:**
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

**Verificar se a porta está em uso:**
```bash
lsof -i :8000
# Se houver processo, matar:
kill -9 <PID>
```

**Verificar Python:**
```bash
python3 --version  # Deve ser 3.10+
which python3
```

---

### 2. CORS Policy Error

#### Sintoma
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

#### Solução

**Verificar backend/main.py:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Deve estar assim
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Se não está assim, adicione.**

---

### 3. Variáveis de Ambiente Não Carregadas

#### Sintoma
```
NEXT_PUBLIC_API_URL undefined
fetch to http://undefined/api/v1/gazettes
```

#### Solução

**Criar/verificar frontend/.env.local:**
```bash
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Reiniciar frontend:**
```bash
# Ctrl+C para parar
cd frontend
npm run dev
```

---

### 4. "Cannot find module" Error

#### Sintoma
```
ERROR: Cannot find module '@/services/backend-integration'
ERROR: Cannot find module '@/hooks/useBackendAnalysis'
```

#### Solução

**Verificar se os arquivos existem:**
```bash
ls frontend/services/backend-integration.ts
ls frontend/hooks/useBackendAnalysis.ts
ls frontend/hooks/useComparisonService.ts
```

**Se não existem, criar conforme documentação.**

**Limpar cache Next.js:**
```bash
cd frontend
rm -rf .next
npm run dev
```

---

### 5. TypeScript Errors

#### Sintoma
```
Type 'AnalysisResponse' not found
Type 'SearchResponse' not found
```

#### Solução

**Verificar types/index.ts:**
```bash
cat frontend/types/index.ts | grep "interface AnalysisResponse"
```

**Se não existe, adicionar tipos em frontend/types/index.ts**

**Verificar imports:**
```typescript
import { AnalysisResponse, SearchResponse, ComparisonResponse } from '@/types';
```

---

### 6. API Retorna 404

#### Sintoma
```
GET http://localhost:8000/analyze 404
GET http://localhost:8000/compare 404
```

#### Solução

**Verificar backend/main.py tem os endpoints:**
```python
@app.get("/api/v1/gazettes")
@app.get("/analyze")
@app.get("/compare")
```

**Verificar a URL completa está correta:**
```bash
curl "http://localhost:8000/api/v1/gazettes?territory_ids=5300108&querystring=software"
curl "http://localhost:8000/analyze?territory_id=5300108&since=2024-01-01&until=2024-01-31"
curl "http://localhost:8000/compare?territory_a=5300108&date_a_start=2024-01-01&date_a_end=2024-06-30&territory_b=5208707&date_b_start=2024-01-01&date_b_end=2024-06-30"
```

---

### 7. Análise/Comparação Muito Lenta

#### Sintoma
```
Análise demorando > 5 minutos
"Ainda analisando..."
```

#### Normal? SIM!

**Tempos esperados:**
- 🔍 Busca simples: 1-3 segundos
- 🤖 Análise completa: 30-120 segundos
- ⚖️ Comparação: 60-240 segundos

**O que está acontecendo:**
1. Busca em Querido Diário API (~5-10s)
2. NER com SpaCy (~5-10s)
3. Categorização (~5-10s)
4. **Gemini AI (~30-100s)** ← O mais lento!
5. Formatação e salvamento (~5s)

**Solução:**
- ✅ Esperar
- ✅ Verificar logs do backend
- ✅ Verificar conexão internet
- ✅ Tentar novamente

---

### 8. localStorage Não Funciona

#### Sintoma
```
Erro: localStorage not defined
```

#### Solução

**Verificar se é component client-side:**
```typescript
'use client'; // ✅ DEVE estar no topo

export default function MeuComponent() {
  // Código aqui
}
```

**Usar dynamic import se necessário:**
```typescript
import dynamic from 'next/dynamic';

const MeuComponente = dynamic(() => import('./MeuComponente'), {
  ssr: false,
});
```

---

### 9. Frontend Não Inicia

#### Sintoma
```
Error: Cannot find module 'next'
Error in next.js app startup
```

#### Solução

**Instalar dependências:**
```bash
cd frontend
npm install
```

**Limpar cache:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Verificar Node.js:**
```bash
node --version  # Deve ser 18+
npm --version   # Deve ser 9+
```

---

### 10. Dados Não Aparecem nos Gráficos

#### Sintoma
```
Gráfico vazio após análise
"Nenhum dado disponível"
```

#### Solução

**Verificar dados chegaram:**
```javascript
// DevTools Console (F12)
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log)
```

**Verificar localStorage:**
```javascript
// DevTools Console
console.log(JSON.parse(localStorage.getItem('latest_search')))
```

**Verificar arquivo public/data:**
```bash
cat frontend/public/data/latest_search.json
```

**Se vazio, executar análise novamente.**

---

### 11. Docker Compose Não Inicia

#### Sintoma
```
ERROR: Service backend failed to start
docker-compose up failed
```

#### Solução

**Verificar Docker está rodando:**
```bash
docker --version
docker ps
```

**Limpar containers antigos:**
```bash
docker-compose down -v
docker system prune -a
```

**Reconstruir imagens:**
```bash
docker-compose up --build
```

**Ver logs:**
```bash
docker logs piter-backend
docker logs piter-frontend
```

---

### 12. "Invalid Territory ID"

#### Sintoma
```
Territory ID 1234567 not found
Invalid territory
```

#### Solução

**Usar IDs válidos:**

| Município | ID IBGE | UF |
|-----------|---------|-----|
| Brasília | 5300108 | DF |
| Goiânia | 5208707 | GO |
| Aparecida de Goiânia | 5201405 | GO |

**Verificar código IBGE:**
```bash
# Buscar online
curl "https://servicodados.ibge.gov.br/api/v1/municipios"
```

---

### 13. Gemini API Error

#### Sintoma
```
Error calling Gemini API
403 Unauthorized
API key invalid
```

#### Solução

**Verificar backend tem API key:**
```bash
# backend/main.py ou .env
GOOGLE_API_KEY=sua_chave_aqui
```

**Obter nova chave:**
1. Ir para https://makersuite.google.com/app/apikey
2. Criar nova chave
3. Adicionar em backend/main.py

**Verificar permissões API:**
- ✅ Generative Language API habilitada
- ✅ Quota suficiente

---

## 🔍 Debug Mode

### 1. Ativar Logs Detalhados

**Frontend:**
```typescript
// backend-integration.ts
console.log('🔍 Iniciando busca...', params);
console.log('✅ Resultado:', response);
console.error('❌ Erro:', error);
```

**Backend:**
```python
# main.py
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug(f"Analisando: {territory_id}")
```

### 2. DevTools (F12)

**Network Tab:**
- Verificar requisições HTTP
- Ver status (200, 404, 500, etc)
- Ver response JSON

**Console Tab:**
- Executar fetch() manualmente
- Verificar localStorage
- Ver console.log()

**Storage Tab:**
- Ver localStorage contents
- Limpar se necessário

---

## 📊 Verificar Saúde do Sistema

### Backend Health Check
```bash
# Endpoint
curl http://localhost:8000/health

# Resposta esperada
{"status": "healthy", "timestamp": "..."}
```

### Frontend Health Check
```javascript
// DevTools Console
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Verificar Arquivos Criados
```bash
# Verificar dados salvos
ls -la backend/data_output/ | head -20

# Verificar público
ls -la frontend/public/data/
```

### Verificar Docker
```bash
# Status dos containers
docker-compose ps

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🆘 Se Nada Funcionar

1. **Limpar tudo:**
```bash
# Backend
cd backend
rm -rf .venv __pycache__ *.pyc

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next

# Docker
docker-compose down -v
docker system prune -a
```

2. **Reinstalar:**
```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

3. **Reiniciar:**
```bash
# Terminal 1
cd backend && python3 -m uvicorn main:app --reload

# Terminal 2
cd frontend && npm run dev
```

4. **Testar:**
```bash
curl http://localhost:8000/health
open http://localhost:3000
```

---

## 📞 Contato/Suporte

Se o problema persistir:

1. Verificar logs completos:
```bash
docker-compose logs backend > backend.log
docker-compose logs frontend > frontend.log
```

2. Verificar documentação:
   - `GUIA_INTEGRACAO_RAPIDA.md`
   - `ARQUITETURA_INTEGRACAO.md`
   - `RESUMO_IMPLEMENTACAO.md`

3. Verificar exemplos:
   - `frontend/components/exemplos/ExemplosIntegracao.tsx`

---

## ✅ Checklist de Verificação

Antes de relatar problema, verificar:

- [ ] Backend está rodando: `curl http://localhost:8000/health`
- [ ] Frontend está rodando: `curl http://localhost:3000`
- [ ] Variáveis de ambiente: `cat frontend/.env.local`
- [ ] Python 3.10+: `python3 --version`
- [ ] Node.js 18+: `node --version`
- [ ] Arquivos existem: `ls frontend/services/backend-integration.ts`
- [ ] Tipos definidos: `grep "AnalysisResponse" frontend/types/index.ts`
- [ ] DevTools aberto (F12): verificar Network/Console
- [ ] Logs do backend: `docker-compose logs backend`
- [ ] Conexão internet funciona

---

**Última atualização:** 1 de dezembro de 2025  
**Versão:** P.I.T.E.R v1.3.0  
**Status:** ✅ Documentação Completa
