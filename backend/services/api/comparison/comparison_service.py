# backend/services/api/comparison/comparison_service.py
from typing import Dict, Any
from services.integration.piter_api_orchestrator import run_analysis_pipeline, save_json_file
from datetime import datetime

class ComparisonService:
    async def compare_scenarios(self, 
                                territory_a: str, date_a_start: str, date_a_end: str,
                                territory_b: str, date_b_start: str, date_b_end: str,
                                keywords: str = None) -> Dict[str, Any]:
        
        print(f"⚖️ Iniciando Comparação...")

        # Executa Cenário A (save_as_search=False para NÃO sobrescrever a pesquisa principal)
        result_a = await run_analysis_pipeline(
            territory_a, date_a_start, date_a_end, keywords, save_as_search=False
        )

        # Executa Cenário B
        result_b = await run_analysis_pipeline(
            territory_b, date_b_start, date_b_end, keywords, save_as_search=False
        )

        # Lógica de Vencedor
        total_a = result_a.get("data", {}).get("total_invested", 0)
        total_b = result_b.get("data", {}).get("total_invested", 0)
        diff = abs(total_a - total_b)
        
        winner = "Empate"
        if total_a > total_b: winner = "A"
        elif total_b > total_a: winner = "B"

        comparison_data = {
            "scenario_a": result_a,
            "scenario_b": result_b,
            "summary": {
                "investment_difference": diff,
                "winner": winner,
                "generated_at": datetime.now().isoformat()
            }
        }

        # --- SALVA O ARQUIVO DE COMPARAÇÃO ---
        # Isso cria o 'latest_comparison.json' para a Página de Comparação usar
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"compare_{territory_a}_vs_{territory_b}_{timestamp}.json"
        
        save_json_file(comparison_data, filename, is_latest=True, latest_name="latest_comparison.json")

        return comparison_data