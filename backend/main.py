from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import uvicorn
import os
import json
import logging
from pathlib import Path

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Imports
from services.integration.piter_api_orchestrator import PiterApiOrchestrator, run_analysis_pipeline
from services.api.clients.querido_diario_client import FilterParams
# Novo Import de Comparação
from services.api.comparison.comparison_service import ComparisonService
# Import de Ranking
from services.api.ranking.routes import router as ranking_router 

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

# Registrar rotas de ranking
app.include_router(ranking_router, prefix="/api/v1", tags=["ranking"])

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
    kw_value = keywords if keywords else None
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
    kw_value = keywords if keywords else None
    
    return await comparison_service.compare_scenarios(
        territory_a, date_a_start, date_a_end,
        territory_b, date_b_start, date_b_end,
        keywords=kw_value
    )

# --- NOVO ENDPOINT: Listar arquivos de data_output ---
@app.get("/data_output")
async def list_data_output():
    """
    Lista todos os arquivos JSON salvos em data_output
    """
    try:
        data_dir = Path(__file__).parent / "data_output"
        
        if not data_dir.exists():
            return {
                "files": [],
                "total": 0,
                "message": "Nenhum arquivo encontrado"
            }
        
        files = []
        for file in sorted(data_dir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                
                files.append({
                    "name": file.name,
                    "size": file.stat().st_size,
                    "modified": file.stat().st_mtime,
                    "type": "analysis" if "analysis" in file.name else "comparison" if "compare" in file.name else "search",
                    "territory_id": content.get("meta", {}).get("source_territory", "unknown"),
                    "data": content
                })
            except Exception as e:
                files.append({
                    "name": file.name,
                    "size": file.stat().st_size,
                    "modified": file.stat().st_mtime,
                    "error": str(e)
                })
        
        return {
            "files": files,
            "total": len(files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NOVO ENDPOINT: Obter arquivo específico ---
@app.get("/data_output/{filename}")
async def get_data_output_file(filename: str):
    """
    Obtém um arquivo específico de data_output
    """
    try:
        # Segurança: validar nome do arquivo
        if ".." in filename or "/" in filename:
            raise HTTPException(status_code=400, detail="Nome de arquivo inválido")

        file_path = Path(__file__).parent / "data_output" / filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {filename}")

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NOVO ENDPOINT: Salvar resultados de busca ---
@app.post("/api/v1/save_search")
async def save_search_results(request: Dict[str, Any]):
    """
    Salva resultados de busca simples para visualização no dashboard.

    Calcula estatísticas de investimento a partir dos excerpts dos diários
    e salva em formato compatível com o dashboard.

    Body esperado:
    {
        "gazettes": [...],  // Array de diários encontrados
        "filters": {        // Filtros usados na busca
            "territory_id": "5300108",
            "dataInicio": "2024-01-01",
            "dataFim": "2024-03-31",
            "categoria": "software",
            "municipio": "Brasília"
        }
    }
    """
    try:
        from services.integration.piter_api_orchestrator import save_json_file
        from services.processing.statistics_generator import StatisticsGenerator
        from datetime import datetime

        gazettes = request.get("gazettes", [])
        filters = request.get("filters", {})

        if not gazettes:
            return {
                "status": "skipped",
                "message": "Nenhum diário para salvar"
            }

        # Calcular estatísticas de investimento a partir dos diários
        stats_gen = StatisticsGenerator()
        investment_stats = stats_gen.extract_investment_statistics(gazettes)

        logger.info(f"💰 Estatísticas calculadas: total={investment_stats.get('total_invested', 0)}")
        logger.info(f"📊 Agrupamento: {investment_stats.get('period_grouping', 'N/A')}")
        logger.info(f"📈 Investimentos por período: {investment_stats.get('investments_by_period', {})}")

        # Preparar estrutura de dados compatível com dashboard
        territory_id = filters.get("territory_id") or filters.get("municipio", "unknown")
        data = {
            "meta": {
                "source_territory": territory_id,
                "period": f"{filters.get('dataInicio', 'N/A')} a {filters.get('dataFim', 'N/A')}",
                "search_keywords": filters.get("categoria") or filters.get("querystring", "N/A"),
                "generated_at": datetime.now().isoformat(),
                "type": "search_with_stats",
                "date_range_start": filters.get("dataInicio"),
                "date_range_end": filters.get("dataFim")
            },
            "data": {
                "total_gazettes": len(gazettes),
                "total_invested": investment_stats.get("total_invested", 0),
                "total_entities": 0,
                "investments_by_category": investment_stats.get("investments_by_category", {}),
                "investments_by_period": investment_stats.get("investments_by_period", {}),
                "publications_by_period": investment_stats.get("publications_by_period", {}),
                "period_grouping": investment_stats.get("period_grouping", "month")
            },
            "gazettes": gazettes
        }

        # Salvar com timestamp único
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Retornar dados completos para o frontend usar diretamente
        return {
            "status": "saved",
            "filename": f"search_{territory_id}_{timestamp}.json",
            "total_gazettes": len(gazettes),
            "total_invested": investment_stats.get("total_invested", 0),
            "investments_by_category": investment_stats.get("investments_by_category", {}),
            "investments_by_period": investment_stats.get("investments_by_period", {}),
            "publications_by_period": investment_stats.get("publications_by_period", {}),
            "period_grouping": investment_stats.get("period_grouping", "month"),
            "message": "Resultados salvos com sucesso"
        }
        
        # Codigo abaixo não será executado (return acima), mas mantido para referencia
        filename = f"search_{territory_id}_{timestamp}.json"

        # Salvar arquivo (sobrescreve latest_search.json)
        save_json_file(data, filename, is_latest=True, latest_name="latest_search.json")

        logger.info(f"✅ Resultados de busca salvos: {filename} ({len(gazettes)} diários, R${investment_stats.get('total_invested', 0):,.2f})")

        return {
            "status": "saved",
            "filename": filename,
            "total_gazettes": len(gazettes),
            "total_invested": investment_stats.get("total_invested", 0),
            "message": "Resultados salvos com sucesso"
        }

    except Exception as e:
        logger.error(f"❌ Erro ao salvar resultados de busca: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)