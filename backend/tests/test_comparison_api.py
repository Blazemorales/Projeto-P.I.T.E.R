# backend/tests/test_comparison_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Dados fictícios para simular o retorno do pipeline
def mock_analysis_result(invested_amount):
    return {
        "meta": {
            "source_territory": "5300108",
            "period": "2024-01-01 a 2024-01-05",
            "search_keywords": "teste"
        },
        "data": {
            "total_invested": invested_amount,
            "investments_by_category": {
                "Tecnologia": invested_amount
            },
            "qualitative_analysis": {
                "resumo_objeto": "Teste",
                "justificativa": "Teste",
                "fornecedor": "Teste LTDA"
            }
        }
    }

# --- TESTE 1: Cenário A Vence ---
def test_compare_scenario_a_wins(mocker):
    """
    Testa se a API declara o Cenário A como vencedor quando seu investimento é maior.
    """
    print("\n🧪 Executando teste: Cenário A Vence...")

    # Mockamos o 'run_analysis_pipeline' que é chamado pelo ComparisonService
    # Usamos side_effect para retornar valores diferentes em chamadas consecutivas
    # 1ª chamada (Cenário A): R$ 1000
    # 2ª chamada (Cenário B): R$ 500
    mocker.patch(
        "services.api.comparison.comparison_service.run_analysis_pipeline",
        side_effect=[mock_analysis_result(1000.0), mock_analysis_result(500.0)]
    )

    # Faz a requisição
    response = client.get(
        "/compare",
        params={
            "territory_a": "5300108", "date_a_start": "2024-01-01", "date_a_end": "2024-01-05",
            "territory_b": "5300108", "date_b_start": "2024-02-01", "date_b_end": "2024-02-05",
            "keywords": "teste"
        }
    )

    # Validações
    assert response.status_code == 200
    data = response.json()
    
    # Verifica se os dados mockados foram usados
    assert data["scenario_a"]["data"]["total_invested"] == 1000.0
    assert data["scenario_b"]["data"]["total_invested"] == 500.0
    
    # Verifica a lógica de comparação
    assert data["summary"]["winner"] == "A"
    assert data["summary"]["investment_difference"] == 500.0
    
    print("✅ Cenário A venceu corretamente!")

# --- TESTE 2: Cenário B Vence ---
def test_compare_scenario_b_wins(mocker):
    """
    Testa se a API declara o Cenário B como vencedor.
    """
    print("\n🧪 Executando teste: Cenário B Vence...")

    # Cenário A: 100 | Cenário B: 900
    mocker.patch(
        "services.api.comparison.comparison_service.run_analysis_pipeline",
        side_effect=[mock_analysis_result(100.0), mock_analysis_result(900.0)]
    )

    response = client.get(
        "/compare",
        params={
            "territory_a": "5300108", "date_a_start": "2024-01-01", "date_a_end": "2024-01-05",
            "territory_b": "5300108", "date_b_start": "2024-02-01", "date_b_end": "2024-02-05",
            "keywords": "teste"
        }
    )

    data = response.json()
    assert data["summary"]["winner"] == "B"
    # A diferença deve ser absoluta (positiva)
    assert data["summary"]["investment_difference"] == 800.0 
    
    print("✅ Cenário B venceu corretamente!")

# --- TESTE 3: Empate ---
def test_compare_tie(mocker):
    """
    Testa se a API declara Empate quando valores são iguais.
    """
    print("\n🧪 Executando teste: Empate...")

    # Ambos com R$ 1000
    mocker.patch(
        "services.api.comparison.comparison_service.run_analysis_pipeline",
        side_effect=[mock_analysis_result(1000.0), mock_analysis_result(1000.0)]
    )

    response = client.get(
        "/compare",
        params={
            "territory_a": "5300108", "date_a_start": "2024-01-01", "date_a_end": "2024-01-05",
            "territory_b": "5300108", "date_b_start": "2024-02-01", "date_b_end": "2024-02-05",
            "keywords": "teste"
        }
    )

    data = response.json()
    assert data["summary"]["winner"] == "Empate"
    assert data["summary"]["investment_difference"] == 0.0
    
    print("✅ Empate detectado corretamente!")