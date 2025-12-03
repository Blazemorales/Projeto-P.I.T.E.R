#!/usr/bin/env python3
"""
Script de teste para validar as correções no sistema de categorização.
Testa o exemplo fornecido pelo usuário.
"""

import sys
sys.path.append('./backend')

from services.processing.statistics_generator import StatisticsGenerator

# Exemplo fornecido pelo usuário
test_gazette = {
    "excerpts": [
        """
        Contrato: 018/2025.
        Processo: 25.20.000002859-1/SEI.
        Contratante: Instituto de Previdência dos Servidores do Município de Goiânia-GOIANIAPREV.
        Contratada: 48.511.241 Marcos Oliveira da Silva, CNPJ nº 48.511.241/0001-21.
        Objeto: Contratação de empresa especializada para o fornecimento de catracas eletrônicas com software integrado de controle
        de acesso, incluindo serviços de locação, instalação, treinamento e suporte técnico, em atendimento às necessidades do Instituto
        de Previdência dos Servidores do Município de Goiânia-GOIANIAPREV.
        Fundamento: Esta contratação direta decorre do Processo SEI n° 25.20.000002859-1, fundamentado em Dispensa de Licitação,
        na forma do disposto no artigo 75, inciso II, da Lei n° 14.133/2021, em conformidade com o contido no Parecer nº 703/2025, da
        Chefia de Advocacia Setorial do GOIANIAPREV (doc. nº 8274916).
        Valor: R$ 26.900,00 (vinte e seis mil e novecentos reais).
        Dotação Orçamentária: 2025.5101.04.122.0028.2451.33903900.177.540.
        Vigência: O prazo de vigência da contratação é de 12 (doze) meses contados a partir da publicação de seu extrato no PNCP –
        Portal Nacional de Contratações Públicas, prorrogável por até 10 anos, na forma dos artigos 106 e 107 da Lei nº 14.133, de 2021.
        Data da assinatura: 27 de novembro de 2025 (data da última assinatura eletrônica).
        Signatários:
        Carolina Alves Luiz Pereira – Presidente do GOIANIAPREV
        Marcos Oliveira Da Silva – Representante da Contratada.
        """
    ],
    "date": "2025-11-27",
    "territory_id": "5208707"
}

def test_categorization():
    print("=" * 80)
    print("TESTE DE CATEGORIZAÇÃO - Solução Balanceada (1+2+3)")
    print("=" * 80)
    print()

    generator = StatisticsGenerator()

    # Teste com o exemplo fornecido
    gazettes = [test_gazette]

    print("📄 Texto de Teste:")
    print("-" * 80)
    print(test_gazette["excerpts"][0][:500] + "...")
    print("-" * 80)
    print()

    print("🔍 Palavras-chave presentes no texto:")
    text = test_gazette["excerpts"][0].lower()
    keywords_found = []

    # Verifica Software e Licenças
    software_keywords = ["software", "software integrado", "catraca eletrônica", "controle de acesso", "contratação"]
    for kw in software_keywords:
        if kw in text:
            keywords_found.append(kw)

    for kw in keywords_found:
        print(f"  ✅ '{kw}'")
    print()

    # Extrai estatísticas
    print("🧮 Processando estatísticas...")
    stats = generator.extract_investment_statistics(gazettes)

    print()
    print("=" * 80)
    print("📊 RESULTADOS")
    print("=" * 80)
    print()

    print(f"💰 Total Investido: R$ {stats['total_invested']:,.2f}")
    print()

    print("📁 Investimentos por Categoria:")
    for category, value in stats['investments_by_category'].items():
        percentage = (value / stats['total_invested'] * 100) if stats['total_invested'] > 0 else 0
        icon = "✅" if value > 0 else "❌"
        print(f"  {icon} {category:25} R$ {value:12,.2f}  ({percentage:5.1f}%)")

    print()
    print("=" * 80)

    # Verifica se o teste passou
    if stats['investments_by_category']['Software e Licenças'] > 0:
        print("✅ TESTE PASSOU! Software detectado corretamente!")
        print()
        print("🎉 As correções estão funcionando:")
        print("   ✓ Validação restritiva removida")
        print("   ✓ CATEGORY_MAP melhorado com mais palavras-chave")
        print("   ✓ Janelas de contexto aumentadas (300/600/800)")
        return True
    else:
        print("❌ TESTE FALHOU! Software não foi detectado.")
        print()
        print("⚠️  Possíveis problemas:")
        print("   • Valor pode estar sendo excluído por EXCLUSION_TERMS")
        print("   • Score pode estar muito baixo")
        print("   • Contexto ainda pode ser insuficiente")
        return False

if __name__ == "__main__":
    success = test_categorization()
    sys.exit(0 if success else 1)
