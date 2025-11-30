# backend/services/integration/piter_api_orchestrator.py
import json
import os
from datetime import datetime
from typing import Dict, Any
from httpx import RequestError

from services.api.clients import querido_diario_client, spacy_api_client
from services.api.clients.querido_diario_client import FilterParams, QueridoDiarioClient
from services.processing import data_cleaner
from services.processing.statistics_generator import StatisticsGenerator
# Import condicional para evitar erro circular se não estiver configurado
try:
    from services.api.clients import gemini_client
except ImportError:
    gemini_client = None

class PiterApiOrchestrator:
    def __init__(self):
        self.qd_client = QueridoDiarioClient()
    
    async def get_enriched_gazette_data(self, filters: FilterParams) -> Dict[str, Any]:
        gazette_data = await self.qd_client.fetch_gazettes(filters)
        return gazette_data

def save_json_file(data: Dict[str, Any], filename: str, is_latest: bool = False, latest_name: str = ""):
    try:
        frontend_path = os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "public", "data"))
        backend_path = os.path.abspath(os.path.join(os.getcwd(), "data_output"))
        os.makedirs(frontend_path, exist_ok=True)
        os.makedirs(backend_path, exist_ok=True)

        with open(os.path.join(frontend_path, filename), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        with open(os.path.join(backend_path, filename), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        if is_latest and latest_name:
            with open(os.path.join(frontend_path, latest_name), "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"✅ [PERSISTÊNCIA] '{latest_name}' atualizado. Valor Total: {data['data'].get('total_invested', 0)}")
            
    except Exception as e:
        print(f"❌ [ERRO] Falha ao salvar arquivos: {e}")

async def run_analysis_pipeline(territory_id: str, since: str, until: str, keywords: str = None, save_as_search: bool = True) -> Dict[str, Any]:
    print(f"🚀 Iniciando pipeline (keywords={keywords})...")

    # 1. Coleta
    try:
        gazette_data = await querido_diario_client.fetch_gazettes(territory_id, since, until, keywords=keywords)
    except RequestError as e:
        return {"error": "Erro de conexão"}

    if not gazette_data or "gazettes" not in gazette_data or not gazette_data["gazettes"]:
        return {"error": "Nenhum diário encontrado."}

    # Agregação
    all_raw_text_segments = []
    for gazette in gazette_data["gazettes"]:
        excerpt_list = gazette.get("excerpts", [])
        if excerpt_list:
            for text_segment in excerpt_list:
                if text_segment:
                    all_raw_text_segments.append(text_segment)

    if not all_raw_text_segments:
        return {"error": "Nenhum texto encontrado."}

    full_raw_text = " ".join(all_raw_text_segments)

    # 2. Limpeza
    cleaned_text = data_cleaner.pre_filter_spacy_input(full_raw_text)
    if not cleaned_text:
        return {"error": "Texto vazio após limpeza."}

    # 3. IA (SpaCy)
    entities = await spacy_api_client.extract_entities(cleaned_text)

    # 4. Estatísticas
    stats_gen = StatisticsGenerator()
    entity_stats = stats_gen.calculate_entity_statistics(entities)
    investment_stats = stats_gen.extract_investment_statistics(gazette_data["gazettes"])
    
    final_statistics = {**entity_stats, **investment_stats}
    
    # Debug: Verificar se o dinheiro está aqui
    print(f"💰 [DEBUG ORCHESTRATOR] Total Investido encontrado: {final_statistics.get('total_invested')}")

    # 5. Análise Qualitativa (Gemini)
    qualitative_analysis = {}
    if final_statistics.get("total_invested", 0) > 0 and gemini_client:
         print("🧠 Acionando IA Generativa...")
         qualitative_analysis = await gemini_client.analyze_investment_context(cleaned_text)

    final_result = {
        "meta": {
            "source_territory": territory_id,
            "period": f"{since} a {until}",
            "search_keywords": str(keywords) if keywords else "padrão",
            "generated_at": datetime.now().isoformat()
        },
        "data": {
            **final_statistics,
            "qualitative_analysis": qualitative_analysis
        }
    }

    if save_as_search:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"search_{territory_id}_{timestamp}.json"
        save_json_file(final_result, filename, is_latest=True, latest_name="latest_search.json")
    
    return final_result