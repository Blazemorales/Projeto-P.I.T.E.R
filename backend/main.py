from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import uvicorn

# Imports
from services.integration.piter_api_orchestrator import PiterApiOrchestrator, run_analysis_pipeline
from services.api.clients.querido_diario_client import FilterParams
# Novo Import de Comparação
from services.api.comparison.comparison_service import ComparisonService 

app = FastAPI(
    title="P.I.T.E.R API",
    description="Plataforma de Integração e Transparência em Educação e Recursos",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PiterApiOrchestrator()
comparison_service = ComparisonService() # Instancia o serviço

@app.get("/")
async def read_root():
    return {"project": "P.I.T.E.R", "status": "Online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

# ... (Mantenha o endpoint /api/v1/gazettes igual) ...
@app.get("/api/v1/gazettes")
async def get_gazettes(
    territory_ids: str = Query(..., description="Código IBGE do município"),
    published_since: str = Query(None, description="Data inicial"),
    published_until: str = Query(None, description="Data final"),
    querystring: str = Query(None, description="Palavra-chave"),
    size: int = Query(5, description="Quantidade"),
):
    try:
        filters = FilterParams(
            territory_ids=territory_ids,
            published_since=published_since,
            published_until=published_until,
            querystring=querystring,
            size=size
        )
        return await orchestrator.get_enriched_gazette_data(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... (Mantenha o endpoint /analyze igual) ...
@app.get("/analyze", response_model=Dict[str, Any])
async def analyze_gazettes(
    territory_id: str = "5300108",
    since: str = "2024-01-01",
    until: str = "2024-01-05",
    keywords: str = Query(None, description="Palavra-chave para filtro")
):
    kw_value = keywords if keywords and keywords is not ... else None
    return await run_analysis_pipeline(
        territory_id=territory_id,
        since=since,
        until=until,
        keywords=kw_value
    )

# --- NOVO ENDPOINT DE COMPARAÇÃO ---
@app.get("/compare", response_model=Dict[str, Any])
async def compare_territories(
    territory_a: str = Query(..., description="ID do Território A"),
    date_a_start: str = Query(..., description="Início Data A"),
    date_a_end: str = Query(..., description="Fim Data A"),
    territory_b: str = Query(..., description="ID do Território B"),
    date_b_start: str = Query(..., description="Início Data B"),
    date_b_end: str = Query(..., description="Fim Data B"),
    keywords: str = Query(None, description="Palavra-chave comum")
):
    """
    Compara investimentos em tecnologia entre dois territórios ou períodos.
    """
    kw_value = keywords if keywords and keywords is not ... else None
    
    return await comparison_service.compare_scenarios(
        territory_a, date_a_start, date_a_end,
        territory_b, date_b_start, date_b_end,
        keywords=kw_value
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)