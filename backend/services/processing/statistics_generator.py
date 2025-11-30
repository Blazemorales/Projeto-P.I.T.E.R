import re
from typing import List, Dict, Any

try:
    import pandas as pd
except Exception:
    pd = None

# --- MAPEAMENTO: Categoria de Tecnologia ---
CATEGORY_MAP = {
    "Equipamentos (Hardware)": [
        "computador", "computadores", "notebook", "notebooks", "laptop", 
        "tablet", "tablets", "chromebook", "desktop", "impressora", 
        "projetor", "datashow", "lousa digital", "monitor", "tela interativa",
        "nobreak", "estabilizador", "servidor", "laboratório de informática",
        "microcomputador", "processamento de dados"
    ],
    "Conectividade": [
        "internet", "wi-fi", "wifi", "banda larga", "fibra óptica", 
        "link de dados", "roteador", "switch", "cabeamento", "rede lógica", 
        "acesso à internet", "ponto de acesso", "access point"
    ],
    "Software e Licenças": [
        "licença de software", "sistema de gestão", "aplicativo", "app", 
        "plataforma digital", "ambiente virtual", "ava", "google workspace", 
        "microsoft office", "antivírus", "sistema acadêmico", "software educativo",
        "jogos digitais", "gamificação", "sistemas informatizados"
    ],
    "Robótica e Maker": [
        "robótica", "kit de robótica", "arduino", "lego education", "cultura maker", 
        "impressora 3d", "filamento", "cortadora a laser", "programação", 
        "componentes eletrônicos", "scratch", "micro:bit"
    ],
    "Infraestrutura de TI": [
        "ar condicionado para laboratório", "instalação elétrica", "adequação de sala",
        "segurança da informação", "suporte técnico", "manutenção de computadores",
        "formação tecnológica", "capacitação em tecnologia", "outsourcing de impressão"
    ]
}

# --- FILTRO DE EXCLUSÃO REFINADO (Versão Final) ---
EXCLUSION_TERMS = [
    # Termos de RH e Salários (Falsos Positivos Mais Comuns)
    "pecúnia", "indenização", "licença-prêmio", "aposentadoria", "pensão", 
    "folha de pagamento", "vencimentos", "remuneração", "salário", "cargo de", 
    "operador de computador", "técnico em informática", "analista de sistemas",
    "benefícios previdenciários", "previdência", "inativos e pensionistas", # <--- ADICIONADO
    "pessoal decorrentes de", "terceirização", # <--- ADICIONADO
    "despesas de pessoal", "encargos sociais",

    # Termos Fiscais e Orçamentários (LRF - Lei de Responsabilidade Fiscal)
    "icms", "imposto", "tributo", "arrecadação", "receita", "crédito suplementar", 
    "multa", "ressarcimento", "diárias", "auxílio",
    "lrf", "art. 18", "art. 19", "despesas não computadas", "dotação", "suplementação",
    "superávit", "dívida", "amortização", "precatórios",
    "balanço orçamentário", "receitas correntes", "despesas correntes"
]

class StatisticsGenerator:
    def __init__(self):
        pass

    def generate_statistics(self, gazette_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        if isinstance(gazette_data, dict) and 'gazettes' in gazette_data:
            gazettes_list = gazette_data.get('gazettes') or []
        else:
            gazettes_list = gazette_data or []

        if not gazettes_list:
            return self._get_empty_stats()

        df = pd.DataFrame(gazettes_list) if pd is not None else None
        stats = {
            "total_gazettes": len(gazettes_list),
            "date_range": {
                "start": (df['date'].min() if df is not None and 'date' in df.columns else None),
                "end": (df['date'].max() if df is not None and 'date' in df.columns else None)
            }
        }

        entities_stats = self.calculate_entity_statistics(self._extract_entities(gazettes_list))
        stats.update(entities_stats)

        investment_stats = self.extract_investment_statistics(gazettes_list)
        stats.update(investment_stats)

        return stats

    def extract_investment_statistics(self, gazettes: List[Dict[str, Any]]) -> Dict[str, Any]:
            total_invested = 0.0
            category_totals = {cat: 0.0 for cat in CATEGORY_MAP.keys()}
            category_totals["Outros"] = 0.0

            money_re = re.compile(r"(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})")

            for gazette in gazettes:
                text_content = ""
                if "excerpts" in gazette and gazette["excerpts"]:
                    if isinstance(gazette["excerpts"], list):
                        text_content = "\n".join([str(e) for e in gazette["excerpts"] if e])
                    else:
                        text_content = str(gazette["excerpts"])
                elif "excerpt" in gazette:
                    text_content = str(gazette["excerpt"])
                
                if not text_content:
                    continue

                matches = money_re.finditer(text_content)
                
                for match in matches:
                    value_str = match.group(1)
                    try:
                        clean_value = float(value_str.replace('.', '').replace(',', '.'))
                    except ValueError:
                        continue

                    if clean_value < 100 or clean_value > 1000000000: 
                        continue

                    start_index = match.start()
                    end_index = match.end()
                    context_window = text_content[max(0, start_index - 300) : min(len(text_content), end_index + 300)].lower()
                    
                    # --- DEBUG: Ver o que está acontecendo com o valor gigante ---
                    if clean_value > 1000000: # Só mostra valores acima de 1 milhão
                        print(f"\n💰 [DEBUG] Valor Gigante Encontrado: R$ {clean_value}")
                        print(f"🔍 Contexto ao redor (-300/+300 chars):\n{context_window}\n")
                        # Verifica se achou termo de exclusão
                        found_exclusion = [t for t in EXCLUSION_TERMS if t in context_window]
                        if found_exclusion:
                            print(f"❌ SERIA EXCLUÍDO POR: {found_exclusion}")
                        else:
                            print(f"⚠️ NÃO FOI EXCLUÍDO! Nenhuma palavra proibida encontrada na janela.")
                        print("-" * 50)
                    # -------------------------------------------------------------

                    # Lógica de exclusão
                    if any(term in context_window for term in EXCLUSION_TERMS):
                        continue
                    
                    found_category = "Outros"
                    
                    for category, keywords in CATEGORY_MAP.items():
                        for keyword in keywords:
                            if keyword in context_window:
                                found_category = category
                                break 
                        if found_category != "Outros":
                            break

                    total_invested += clean_value
                    category_totals[found_category] += clean_value

            total_invested = round(total_invested, 2)
            category_totals = {k: round(v, 2) for k, v in category_totals.items()}
            
            return {
                "total_invested": total_invested,
                "investments_by_category": category_totals
            }
    def calculate_entity_statistics(self, entities: List[Dict[str, str]]) -> Dict[str, Any]:
        if not entities:
            return {"entity_counts_by_type": {}, "top_entities": {}}

        if pd is not None:
            df = pd.DataFrame(entities)
            counts = df['label'].value_counts().to_dict() if 'label' in df.columns else {}
            valid_entities = df[df['text'].str.len() > 3] if 'text' in df.columns else df
            top = valid_entities['text'].value_counts().head(10).to_dict() if 'text' in valid_entities.columns else {}
        else:
            counts = {}
            top = {}

        return {
            "entity_counts_by_type": counts,
            "top_entities": top
        }
    
    def _extract_entities(self, gazette_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        return []

    def _get_empty_stats(self):
        return {
            "total_gazettes": 0,
            "total_invested": 0.0,
            "investments_by_category": {k: 0.0 for k in CATEGORY_MAP.keys()},
            "entity_counts_by_type": {},
            "top_entities": {}
        }