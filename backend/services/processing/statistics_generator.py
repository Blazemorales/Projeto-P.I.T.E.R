import re
from typing import List, Dict, Any

try:
    import pandas as pd
except Exception:
    pd = None

# --- MAPEAMENTO: Categoria de Tecnologia ---
CATEGORY_MAP = {
    "Hardware & Equipamentos": [
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
        "licença de software", "licença de sistema", "licença de aplicativo",
        "sistema de gestão", "sistema acadêmico", "sistemas informatizados",
        "aplicativo", "app", "plataforma digital", "plataforma online",
        "ambiente virtual", "ava", "ambiente virtual de aprendizagem",
        "google workspace", "microsoft office",
        "software educativo", "software educacional",
        "jogos digitais", "gamificação",
        "antivírus"
    ],

    "Robótica e Maker": [
        # Robótica em geral
        "robótica", "robótica educacional",
        "kit de robótica", "kit de robótica educacional",
        "arduino", "curso de robótica", "oficina de robótica",
        "laboratório de robótica",
        "programação", "programação educacional",
        "scratch", "micro:bit",
        "componentes eletrônicos",

        # Cultura maker / equipamentos
        "cultura maker", 
        "impressora 3d", "filamento",
        "cortadora a laser",
        "lego education"
    ],

    "Infraestrutura de TI": [
        "ar condicionado para laboratório", "instalação elétrica", "adequação de sala",
        "segurança da informação", "suporte técnico", "manutenção de computadores",
        "formação tecnológica", "capacitação em tecnologia", "outsourcing de impressão"
    ]
}


# --- FILTRO DE EXCLUSÃO CORRIGIDO (SEM 'dotação') ---
EXCLUSION_TERMS = [
    "pecúnia", "indenização", "licença-prêmio", "aposentadoria", "pensão", 
    "folha de pagamento", "vencimentos", "remuneração", "salário", "cargo de", 
    "operador de computador", "técnico em informática", "analista de sistemas",
    "benefícios previdenciários", "previdência", "inativos e pensionistas",
    "pessoal decorrentes de", "terceirização", "despesas de pessoal", "encargos sociais",
    "icms", "imposto", "tributo", "arrecadação", "receita", "crédito suplementar", 
    "multa", "ressarcimento", "diárias", "auxílio",
    "lrf", "art. 18", "art. 19", "despesas não computadas", "suplementação",
    # "dotação", <--- REMOVIDO PARA NÃO MATAR CONTRATOS VÁLIDOS
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

                if clean_value < 100 or clean_value > 100000000: 
                    continue

                start_index = match.start()
                end_index = match.end()
                context_window = text_content[max(0, start_index - 300) : min(len(text_content), end_index + 300)].lower()
                
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
            return {
                "total_entities": 0,
                "entity_counts_by_type": {},
                "top_entities": {}
            }

        if pd is not None:
            df = pd.DataFrame(entities)
            if 'label' in df.columns:
                # Conta apenas rótulos válidos (não nulos) para evitar erro no teste de dados mal formados
                total_entities = int(df['label'].count())
                counts = df['label'].value_counts().to_dict()
            else:
                total_entities = 0
                counts = {}
            
            if 'text' in df.columns:
                valid_text = df['text'].astype(str)
                valid_text = valid_text[valid_text.str.len() > 3]
                top_entities = valid_text.value_counts().head(10).to_dict()
            else:
                top_entities = {}
        else:
            valid_entities = [e for e in entities if e.get('label')]
            total_entities = len(valid_entities)
            counts = {}
            top_entities = {}

        return {
            "total_entities": total_entities,
            "entity_counts_by_type": counts,
            "top_entities": top_entities
        }
    
    def _extract_entities(self, gazette_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        return []

    def _get_empty_stats(self):
        return {
            "total_gazettes": 0,
            "total_invested": 0.0,
            "investments_by_category": {k: 0.0 for k in CATEGORY_MAP.keys()},
            "total_entities": 0,
            "entity_counts_by_type": {},
            "top_entities": {}
        }