import pytest
import httpx # Importe httpx para simular erros
from fastapi.testclient import TestClient
from main import app


# Cria um cliente de teste para fazer requisições à API
client = TestClient(app)

# --- Teste para o cenário de texto vazio/inválido ---
def test_analyze_endpoint_with_empty_text(mocker):
    """
    Testa se o endpoint /analyze retorna o erro correto quando
    o texto do diário resulta em vazio após a limpeza.
    """
    print("\nExecutando test_analyze_endpoint_with_empty_text...")

    # --- Simulação (Mock) ---
    # 1. Simula a resposta do Querido Diário Client
    # Dizemos ao mocker para substituir a função 'fetch_gazettes'
    # e fazer ela retornar um dicionário específico.
    mock_gazette_data_empty_excerpt = {
        "total_gazettes": 1,
        "gazettes": [
            {
                "territory_id": "5300108",
                "date": "2024-01-01",
                "url": "http://example.com/gazette.pdf",
                "excerpts": [], # <-- O ponto chave: lista vazia (sem texto)
                "edition_number": "1",
                "is_extra_edition": False,
                "power": "executive"
            }
        ]
    }
    mocker.patch(
        # Caminho completo para a função que queremos substituir
        # (Ajuste se o nome do módulo/arquivo for diferente)
        # Como estamos rodando de dentro do backend:
        "services.api.clients.querido_diario_client.fetch_gazettes",
        return_value=mock_gazette_data_empty_excerpt # O que a função simulada vai retornar
    )

    # (Opcional) Poderíamos mockar o data_cleaner também, mas vamos confiar nele por agora.
    # Se o excerpt for "", o cleaner provavelmente retornará "".

    # --- Ação ---
    # Chama o endpoint /analyze da API (sem parâmetros, usando os defaults)
    print("Chamando o endpoint /analyze...")
    response = client.get("/analyze")
    print(f"Resposta recebida: Status={response.status_code}, JSON={response.json()}")

    # --- Verificação (Assertions) ---
    # 1. Verifica se o status code da resposta é 200 (como está no código atual)
    assert response.status_code == 200, f"Esperado status 200, mas veio {response.status_code}"

    # 2. Verifica se o JSON retornado é exatamente o erro esperado
    expected_error = {"error": "Texto do diário está vazio ou inválido."}
    assert response.json() == expected_error, f"Esperado {expected_error}, mas veio {response.json()}"

    print("Teste passou!")
    


# --- Teste para o cenário de texto vazio/inválido ---
def test_analyze_endpoint_with_empty_text(mocker):
    # ... (código do teste anterior) ...
    print("\nExecutando test_analyze_endpoint_with_empty_text...")
    # ... (restante do código do teste anterior) ...
    print("Teste de texto vazio passou!")


# --- NOVO TESTE: Cenário de Sucesso Completo ---
def test_analyze_endpoint_success(mocker):
    """
    Testa o fluxo completo bem-sucedido do endpoint /analyze,
    mockando as respostas das APIs externas.
    """
    print("\nExecutando test_analyze_endpoint_success...")

    # --- Simulação (Mocks) ---
    # 1. Mock da resposta do Querido Diário Client (com texto válido)
    mock_gazette_data_with_text = {
        "total_gazettes": 1,
        "gazettes": [
            {
                "territory_id": "5300108",
                "date": "2024-01-01",
                "url": "http://example.com/gazette.pdf",
                # Texto de exemplo que será processado (note: 'excerpts' é uma lista)
                "excerpts": ["A Prefeitura de Brasília informa sobre licitação."],
                "edition_number": "1",
                "is_extra_edition": False,
                "power": "executive"
            }
        ]
    }
    mocker.patch(
        "services.api.clients.querido_diario_client.fetch_gazettes",
        return_value=mock_gazette_data_with_text
    )

    # 2. Mock da resposta do Spacy API Client (com entidades de exemplo)
    mock_spacy_entities = [
        {"text": "Prefeitura de Brasília", "label": "ORG"}, # Organização
        {"text": "licitação", "label": "MISC"}           # Miscelânea
    ]
    mocker.patch(
        "services.api.clients.spacy_api_client.extract_entities",
        return_value=mock_spacy_entities
    )

    # --- Ação ---
    # Chama o endpoint /analyze
    print("Chamando o endpoint /analyze...")
    response = client.get("/analyze")
    print(f"Resposta recebida: Status={response.status_code}, JSON={response.json()}")

    # --- Verificação (Assertions) ---
    # 1. Verifica se o status code é 200 (OK)
    assert response.status_code == 200, f"Esperado status 200, mas veio {response.status_code}"

    # 2. Verifica a estrutura geral da resposta
    data = response.json()
    assert isinstance(data, dict)
    assert "meta" in data
    assert "data" in data
    assert "error" not in data # Garante que não houve erro

    # 3. Verifica a estrutura do meta
    meta = data["meta"]
    assert "source_territory" in meta
    assert "period" in meta
    assert meta["source_territory"] == "5300108"

    # 4. Verifica as estatísticas calculadas (baseadas nos mocks)
    stats = data["data"]
    assert isinstance(stats, dict)
    assert stats["total_entities"] == 2 # Esperamos 2 entidades do mock do Spacy
    assert stats["entity_counts_by_type"] == {"ORG": 1, "MISC": 1} # Contagem por tipo
    assert stats["top_entities"] == {"Prefeitura de Brasília": 1, "licitação": 1} # Entidades encontradas

    print("Teste de sucesso passou!")
    
def test_analyze_endpoint_qd_failure(mocker):
    """
    Testa se o endpoint /analyze lida corretamente com uma falha
    na chamada à API do Querido Diário.
    """
    print("\nExecutando test_analyze_endpoint_qd_failure...")

    # --- Simulação (Mock) ---
    # Simula a função fetch_gazettes para levantar um erro de conexão
    mocker.patch(
        "services.api.clients.querido_diario_client.fetch_gazettes",
        side_effect=httpx.RequestError("Simulação de erro de conexão com QD")
    )

    # --- Ação ---
    print("Chamando o endpoint /analyze esperando falha do QD...")
    response = client.get("/analyze")
    print(f"Resposta recebida (QD falhou): Status={response.status_code}, JSON={response.json()}")

    # --- Verificação (Assertions) ---
    # O código atual retorna 200 e um JSON de erro específico
    assert response.status_code == 200
    expected_error = {"error": "Erro de conexão"} 
    assert response.json() == expected_error

    print("Teste de falha no Querido Diário passou!")


# --- NOVO TESTE: Falha (ou resposta vazia) na API do Spacy ---
def test_analyze_endpoint_spacy_failure(mocker):
    """
    Testa se o endpoint /analyze lida corretamente quando a API do Spacy
    falha ou retorna uma lista vazia de entidades.
    """
    print("\nExecutando test_analyze_endpoint_spacy_failure...")

    # --- Simulação (Mocks) ---
    # 1. Mock do QD com sucesso (igual ao teste de sucesso)
    mock_gazette_data_with_text = {
        "total_gazettes": 1, "gazettes": [{"excerpts": ["Texto válido aqui."]}]
    }
    mocker.patch(
        "services.api.clients.querido_diario_client.fetch_gazettes",
        return_value=mock_gazette_data_with_text
    )

    # 2. Mock do Spacy Client para retornar uma lista vazia
    # (O código atual já trata exceções e retorna [], então vamos simular o resultado final)
    mocker.patch(
        "services.api.clients.spacy_api_client.extract_entities",
        return_value=[] # Simula Spacy não encontrando nada ou falhando
    )

    # --- Ação ---
    print("Chamando o endpoint /analyze esperando falha/vazio do Spacy...")
    response = client.get("/analyze")
    print(f"Resposta recebida (Spacy falhou/vazio): Status={response.status_code}, JSON={response.json()}")

    # --- Verificação (Assertions) ---
    # 1. Esperamos sucesso (200), pois o pipeline deve continuar
    assert response.status_code == 200

    # 2. Verifica a estrutura geral (sem erro principal)
    data = response.json()
    assert isinstance(data, dict)
    assert "error" not in data
    assert "meta" in data
    assert "data" in data

    # 3. Verifica se as estatísticas refletem zero entidades
    stats = data["data"]
    assert stats["total_entities"] == 0
    assert stats["entity_counts_by_type"] == {}
    assert stats["top_entities"] == {}

    print("Teste de falha/vazio no Spacy passou!")


# --- Teste para a rota raiz ---
def test_read_root():
    # ... (código do teste read_root) ...
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["project"] == "P.I.T.E.R"

# --- (Opcional) Adicione outros testes que você já tinha ou queira criar ---
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "project" in response.json()
    assert response.json()["project"] == "P.I.T.E.R"