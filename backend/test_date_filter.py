#!/usr/bin/env python3
"""
Script de teste para verificar se a filtragem de datas está funcionando.
"""
import asyncio
import sys
from datetime import date
from services.integration.piter_api_orchestrator import PiterApiOrchestrator
from services.api.clients.querido_diario_client import FilterParams

async def test_date_filtering():
    print("=" * 60)
    print("🧪 TESTE DE FILTRAGEM DE DATAS")
    print("=" * 60)

    orchestrator = PiterApiOrchestrator()

    # Teste 1: Busca com intervalo de datas específico
    print("\n📅 Teste 1: Busca com intervalo 2024-01-01 a 2024-03-31")
    print("-" * 60)

    filters = FilterParams(
        territory_ids="5300108",  # Brasília
        published_since=date(2024, 1, 1),
        published_until=date(2024, 3, 31),
        querystring="software",
        size=100
    )

    try:
        result = await orchestrator.get_enriched_gazette_data(filters)
        gazettes = result.get("gazettes", [])
        total = len(gazettes)

        print(f"✅ Total de diários retornados: {total}")

        if total > 0:
            print("\n📋 Verificando datas dos diários:")
            dates_out_of_range = []
            dates_in_range = []

            for gazette in gazettes[:10]:  # Checar primeiros 10
                gazette_date = gazette.get("date")
                print(f"  - Data: {gazette_date}")

                # Verificar se está no intervalo
                if gazette_date:
                    if gazette_date < "2024-01-01" or gazette_date > "2024-03-31":
                        dates_out_of_range.append(gazette_date)
                    else:
                        dates_in_range.append(gazette_date)

            print(f"\n✅ Diários dentro do intervalo: {len(dates_in_range)}")
            print(f"❌ Diários fora do intervalo: {len(dates_out_of_range)}")

            if dates_out_of_range:
                print(f"\n⚠️ PROBLEMA! Encontrados diários fora do intervalo:")
                for d in dates_out_of_range:
                    print(f"  - {d}")
            else:
                print(f"\n🎉 SUCESSO! Todos os diários estão dentro do intervalo!")
        else:
            print("⚠️ Nenhum diário retornado")

    except Exception as e:
        print(f"❌ Erro no teste: {e}")
        import traceback
        traceback.print_exc()

    # Teste 2: Busca sem filtros de data
    print("\n\n📅 Teste 2: Busca SEM filtros de data")
    print("-" * 60)

    filters_no_dates = FilterParams(
        territory_ids="5300108",
        querystring="software",
        size=10
    )

    try:
        result = await orchestrator.get_enriched_gazette_data(filters_no_dates)
        gazettes = result.get("gazettes", [])
        print(f"✅ Total de diários retornados: {len(gazettes)}")

        if len(gazettes) > 0:
            print(f"✅ Primeira data: {gazettes[0].get('date')}")
            print(f"✅ Última data: {gazettes[-1].get('date')}")
    except Exception as e:
        print(f"❌ Erro no teste: {e}")

    print("\n" + "=" * 60)
    print("🏁 TESTES CONCLUÍDOS")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_date_filtering())
