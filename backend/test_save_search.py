#!/usr/bin/env python3
"""
Teste do novo endpoint /api/v1/save_search
"""
import asyncio
import httpx
import json

async def test_save_search_endpoint():
    print("=" * 60)
    print("🧪 TESTE DO ENDPOINT /api/v1/save_search")
    print("=" * 60)

    # Dados de teste simulando uma busca real
    test_data = {
        "gazettes": [
            {
                "territory_id": "5300108",
                "territory_name": "Brasília",
                "date": "2024-01-15",
                "edition": "001",
                "is_extra_edition": False,
                "url": "https://example.com/gazette1.pdf",
                "excerpts": ["Contrato de software..."]
            },
            {
                "territory_id": "5300108",
                "territory_name": "Brasília",
                "date": "2024-02-20",
                "edition": "002",
                "is_extra_edition": False,
                "url": "https://example.com/gazette2.pdf",
                "excerpts": ["Aquisição de licenças..."]
            },
            {
                "territory_id": "5300108",
                "territory_name": "Brasília",
                "date": "2024-03-10",
                "edition": "003",
                "is_extra_edition": False,
                "url": "https://example.com/gazette3.pdf",
                "excerpts": ["Serviços de TI..."]
            }
        ],
        "filters": {
            "territory_id": "5300108",
            "municipio": "Brasília",
            "dataInicio": "2024-01-01",
            "dataFim": "2024-03-31",
            "categoria": "software",
            "querystring": "software"
        }
    }

    try:
        print(f"\n📤 Enviando {len(test_data['gazettes'])} diários para salvar...")
        print(f"   Território: {test_data['filters']['municipio']}")
        print(f"   Período: {test_data['filters']['dataInicio']} até {test_data['filters']['dataFim']}")
        print(f"   Categoria: {test_data['filters']['categoria']}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8000/api/v1/save_search",
                json=test_data,
                timeout=30.0
            )

            print(f"\n📊 Resposta do servidor:")
            print(f"   Status Code: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print(f"   Status: {result.get('status')}")
                print(f"   Arquivo: {result.get('filename')}")
                print(f"   Total de diários: {result.get('total_gazettes')}")
                print(f"   Mensagem: {result.get('message')}")

                if result.get('status') == 'saved':
                    print("\n✅ SUCESSO! Resultados salvos com sucesso.")
                    print(f"\n📁 Verifique o arquivo: backend/data_output/{result.get('filename')}")
                    print("📁 E também: backend/data_output/latest_search.json")
                else:
                    print(f"\n⚠️ AVISO: {result.get('message')}")
            else:
                print(f"\n❌ ERRO: {response.text}")

    except httpx.ConnectError:
        print("\n❌ ERRO: Não foi possível conectar ao backend.")
        print("   Certifique-se de que o servidor está rodando:")
        print("   cd backend && python main.py")
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "=" * 60)
    print("🏁 TESTE CONCLUÍDO")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_save_search_endpoint())
