# P.I.T.E.R - Plataforma de Integração e Transparência em Educação e Recursos

**Procurador de Investimentos em Tecnologia na Educação e Recursos**

Plataforma para busca e análise de diários oficiais municipais com foco em investimentos educacionais em tecnologia e robótica.

##  Links Importantes

- ** Documentação**: [https://unb-mds.github.io/Projeto-P.I.T.E.R/](https://unb-mds.github.io/Projeto-P.I.T.E.R/)
- ** Design (Figma)**: [https://www.figma.com/design/SrD9XAdENSImL4DVWmEZD5/Organização-MDS](https://www.figma.com/design/SrD9XAdENSImL4DVWmEZD5/Organiza%C3%A7%C3%A3o-MDS?node-id=0-1&t=0wOi8rZ1ZfIk7Juu-1)
- **📚 Guia Rápido de Integração**: [GUIA_INTEGRACAO_RAPIDA.md](./GUIA_INTEGRACAO_RAPIDA.md)
- **🏗️ Arquitetura da Integração**: [ARQUITETURA_INTEGRACAO.md](./ARQUITETURA_INTEGRACAO.md)

---

## ✨ Novidade: Integração Backend ↔ Frontend Completa

A integração está **100% funcional** com 3 fluxos principais:

| Fluxo | Descrição | Endpoint |
|-------|-----------|----------|
| 🔍 **Busca Simples** | Busca rápida de diários na API Querido Diário | `GET /api/v1/gazettes` |
| 🤖 **Análise com IA** | Pipeline NER + Estatísticas + Gemini AI | `GET /analyze` |
| ⚖️ **Comparação** | Compara investimentos entre 2 territórios | `GET /compare` |

---

## Arquitetura do Projeto

```
frontend/          # Next.js React Application
├── services/
│   └── backend-integration.ts     ✅ NOVO - Serviço centralizado
├── hooks/
│   ├── useBackendAnalysis.ts      ✅ NOVO - Hook para análise
│   ├── useComparisonService.ts    ✅ NOVO - Hook para comparação
│   └── useGazetteSearch.ts
├── types/
│   └── index.ts                   ✅ ATUALIZADO com tipos novos
├── components/
│   ├── pages/
│   │   └── dashboard-pesquisa.tsx ✅ ATUALIZADO com 3 abas
│   └── exemplos/
│       └── ExemplosIntegracao.tsx ✅ NOVO - 4 exemplos práticos
├── public/data/
│   ├── latest_search.json
│   └── latest_comparison.json
└── .env.local                      ✅ CONFIGURADO

backend/           # FastAPI Python API
├── main.py                         ✅ FastAPI com CORS
├── services/
│   ├── integration/
│   │   └── piter_api_orchestrator.py
│   └── api/comparison/
│       └── comparison_service.py
├── data_output/                    ✅ Análises salvas
└── requirements.txt

docker-compose.yml                 ✅ Orquestração completa
```

---

## Como Executar o Projeto

### Pré-requisitos
- **Node.js** 18+ e **npm**
- **Python** 3.10+
- **Git**

### Importante
**AMBOS os servidores (Backend e Frontend) precisam estar rodando simultaneamente para a aplicação funcionar corretamente!**

Se você receber o erro `"Failed to fetch"` no frontend, verifique se:
1. O backend está rodando na porta 8000
2. Ambos os servidores foram iniciados

### Execução Rápida (Recomendado)

#### 1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd Projeto-P.I.T.E.R
```

#### 2. Inicie o Backend (Terminal 1):
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
# ou venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Em outro terminal, inicie o Frontend (Terminal 2):
```bash
cd frontend
npm install
npm install lucide-react
npm install recharts
cd ..
npm run dev
```

#### 4. Acesse a aplicação:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

---

## Problemas Comuns

### Frontend mostrando versão antiga após atualização
Se após fazer alterações no código o frontend continuar mostrando a versão antiga:

```bash
# Pare o servidor (Ctrl+C) e execute:
lsof -ti:3000 | xargs kill -9  # Mata processo na porta 3000
cd frontend
rm -rf .next                    # Remove cache do Next.js
npm run dev                     # Reinicia o servidor
```

### Erro "Failed to fetch" ao fazer busca
Certifique-se que o backend está rodando:

```bash
# Verifique se a porta 8000 está em uso
lsof -ti:8000

# Se não estiver, inicie o backend:
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Execução com Docker (Recomendado para Iniciantes)

### Por que usar Docker?
- Instala todas as dependências automaticamente
- Funciona em qualquer sistema operacional
- Backend e Frontend rodando juntos
- Não precisa instalar Python, Node.js, etc

### 1. Instalar Docker

#### Windows
1. Baixe o Docker Desktop: https://www.docker.com/products/docker-desktop
2. Execute o instalador
3. Reinicie o computador se solicitado
4. Abra o Docker Desktop para iniciar o serviço

#### macOS
1. Baixe o Docker Desktop: https://www.docker.com/products/docker-desktop
2. Arraste o Docker.app para a pasta Aplicativos
3. Abra o Docker Desktop
4. Autorize as permissões solicitadas

#### Linux (Ubuntu/Debian)
```bash
# Atualizar pacotes
sudo apt-get update

# Instalar dependências
sudo apt-get install ca-certificates curl gnupg

# Adicionar chave GPG do Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar seu usuário ao grupo docker (opcional, evita usar sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### Verificar instalação
```bash
docker --version
docker-compose --version
```

### 2. Rodar o Projeto

#### Primeira vez (Instala tudo automaticamente)
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd Projeto-P.I.T.E.R

# Construir e iniciar os serviços
docker-compose up --build
```

**Aguarde 5-10 minutos na primeira vez** enquanto o Docker:
- Baixa as imagens base (Python 3.12 e Node 18)
- Instala todas as dependências do backend
- Baixa o modelo do spaCy para NLP
- Instala todas as dependências do frontend

#### Próximas vezes (Instantâneo)
```bash
# Iniciar serviços
docker-compose up

# Ou iniciar em background (sem ver logs)
docker-compose up -d
```

### 3. Acessar a Aplicação

Após os containers iniciarem:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

### 4. Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do frontend
docker-compose logs -f frontend

# Parar os serviços (mantém containers)
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar e limpar tudo (incluindo volumes)
docker-compose down -v

# Reconstruir após mudar dependências
docker-compose up --build

# Ver status dos containers
docker-compose ps
```

### 5. Desenvolvimento com Docker

As mudanças no código são refletidas automaticamente:
- **Backend**: Hot reload ativado (muda .py e recarrega)
- **Frontend**: Hot reload ativado (salva componente e atualiza browser)

Seus arquivos locais estão sincronizados com os containers!

---

## Deploy

### Backend (Vercel)
```bash
cd backend
vercel --prod
```

### Frontend (Vercel)
```bash
cd frontend
# Atualizar BACKEND_URL no vercel.json
vercel --prod
```

---

## Funcionalidades

### Busca de Diários Oficiais
- **Filtros Avançados**: Busca por município, categoria, período
- **Municípios de Goiás**: Foco em Goiânia e região metropolitana
- **Categorias**: Robótica educacional e software educativo
- **Integração**: API do Querido Diário para dados oficiais

### Análise Inteligente
- **Processamento NLP**: Análise de texto com spaCy (em desenvolvimento)
- **Extração de Dados**: Identificação automática de investimentos
- **Métricas**: Valores, programas e projetos educacionais

### Interface Moderna
- **Design Responsivo**: TailwindCSS com componentes atômicos
- **UX Otimizada**: Feedback visual e estados de carregamento
- **Acessibilidade**: Seguindo padrões web modernos

---

## Tecnologias Utilizadas

### Frontend (Next.js)
- **Next.js 14** com App Router
- **React 18** + TypeScript
- **TailwindCSS** para estilização
- **Atomic Design** para componentes
- **Custom Hooks** para lógica de estado

### Backend (FastAPI)
- **FastAPI** + Uvicorn
- **Python 3.10+**
- **Pydantic** para validação
- **httpx** para requisições HTTP
- **Integração** com Querido Diário API

---

## Fluxo de Dados

1. **Frontend** coleta filtros do usuário
2. **Backend** processa requisição e consulta Querido Diário API
3. **Orquestrador** enriquece dados com análise NLP (futuro)
4. **Frontend** exibe resultados formatados

---

## Estrutura do Projeto

```bash
Projeto-P.I.T.E.R/
├── frontend/                 # Aplicação Next.js
│   ├── app/                 # App Router do Next.js
│   │   ├── page.tsx         # Página principal
│   │   └── globals.css      # Estilos globais
│   ├── components/          # Componentes React
│   │   ├── atoms/           # Botões, inputs básicos
│   │   ├── molecules/       # Forms, cards
│   │   └── organisms/       # Header, seções completas
│   ├── hooks/               # React Hooks customizados
│   │   └── useGazetteSearch.ts
│   └── types/               # Definições TypeScript
├── backend/                 # API FastAPI
│   ├── services/            # Lógica de negócio
│   │   ├── api/clients/     # Clientes para APIs externas
│   │   └── integration/     # Orquestradores
│   └── main.py             # Aplicação principal
└── docker-compose.yml      # Configuração Docker
```

---

## Configuração de Ambiente

### Backend (.env)
```bash
# Copie o arquivo de exemplo
cp backend/.env.example backend/.env
```

### Frontend (.env.local)
```bash
# Copie o arquivo de exemplo
cp frontend/.env.local.example frontend/.env.local

# Configure a URL do backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deploy em Produção

O projeto está configurado para deploy independente:

- **Frontend**: Vercel
- **Backend**: Vercel, Railway, Heroku
- **Docker**: Qualquer plataforma que suporte containers

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

---

## Equipe

Desenvolvido como parte do projeto de Métodos de Desenvolvimento de Software (MDS) da Universidade de Brasília (UnB).
