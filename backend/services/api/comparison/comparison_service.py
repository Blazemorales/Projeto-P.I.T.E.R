from typing import Dict, Any
from services.integration.piter_api_orchestrator import run_analysis_pipeline

class ComparisonService:
    """
    Serviço responsável por orquestrar a comparação entre dois cenários (Municípios ou Períodos).
    """

    async def compare_scenarios(self, 
                                territory_a: str, date_a_start: str, date_a_end: str,
                                territory_b: str, date_b_start: str, date_b_end: str,
                                keywords: str = None) -> Dict[str, Any]:
        """
        Executa o pipeline de análise para dois alvos e formata a resposta para comparação.
        """
        
        print(f"⚖️ Iniciando Comparação: {territory_a} vs {territory_b}...")

        # Executa análise para o Cenário A
        result_a = await run_analysis_pipeline(
            territory_id=territory_a,
            since=date_a_start,
            until=date_a_end,
            keywords=keywords
        )

        # Executa análise para o Cenário B
        result_b = await run_analysis_pipeline(
            territory_id=territory_b,
            since=date_b_start,
            until=date_b_end,
            keywords=keywords
        )

        # Calcula Deltas (Diferenças) básicos de investimento
        total_a = result_a.get("data", {}).get("total_invested", 0)
        total_b = result_b.get("data", {}).get("total_invested", 0)
        diff = total_a - total_b
        
        comparison_data = {
            "scenario_a": result_a,
            "scenario_b": result_b,
            "summary": {
                "investment_difference": diff,
                "winner": "A" if total_a > total_b else "B" if total_b > total_a else "Empate"
            }
        }

        return comparison_data