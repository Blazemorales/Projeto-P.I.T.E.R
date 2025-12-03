import re
import logging
from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict

try:
    import requests
except ImportError:
    requests = None

try:
    import pandas as pd
except Exception:
    pd = None

logger = logging.getLogger(__name__)

# --- MAPEAMENTO: Categoria de Tecnologia ---
# Subcategorias específicas - cada uma é contada separadamente
# A ordem importa: subcategorias específicas primeiro, depois "Outros" como fallback
CATEGORY_MAP = {
    # Subcategorias de Educação
    "Educação": ["educação", "educacional", "escola", "escolar", "ensino"],
    "Capacitação": ["capacitação", "treinamento", "curso", "cursos"],
    
    # Subcategorias de Infraestrutura  
    "Servidor": ["servidor", "servidores"],
    "Cloud/Nuvem": ["cloud", "nuvem"],
    "Hospedagem": ["hospedagem", "hosting"],
    "Rede": ["rede", "redes", "network"],
    "Backup": ["backup", "armazenamento", "storage"],
    "Data Center": ["data center", "datacenter"],
    
    # Subcategorias de Gestão
    "Gestão": ["gestão", "gerenciamento", "administração"],
    "ERP": ["erp"],
    "Financeiro": ["financeiro", "contábil", "fiscal"],
    
    # Robótica
    "Robótica": ["robótica"],
    
    # Fallback - software genérico que não se encaixa em nenhuma subcategoria
    "Outros": ["software"]
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
        self._txt_cache = {}  # Cache para textos baixados
    
    def _download_full_text(self, txt_url: str) -> str:
        """Baixa o texto completo do diário oficial via txt_url."""
        if not txt_url or not requests:
            return ""
        
        # Verificar cache
        if txt_url in self._txt_cache:
            return self._txt_cache[txt_url]
        
        try:
            response = requests.get(txt_url, timeout=30)
            response.raise_for_status()
            text = response.text
            self._txt_cache[txt_url] = text
            logger.info(f"📥 Texto completo baixado: {len(text)} chars")
            return text
        except Exception as e:
            logger.warning(f"⚠️ Erro ao baixar texto: {e}")
            return ""

    def _parse_date(self, date_value):
        """Tenta converter diferentes formatos de data para `datetime`.
        Retorna `None` se não for possível parsear.
        """
        if not date_value:
            return None

        if isinstance(date_value, datetime):
            return date_value

        if isinstance(date_value, str):
            s = date_value.strip()
            # Tenta ISO primeiro
            try:
                return datetime.fromisoformat(s)
            except Exception:
                pass

            # Tenta formatos comuns
            for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%d/%m/%Y", "%d-%m-%Y"):
                try:
                    return datetime.strptime(s, fmt)
                except Exception:
                    continue

            # Extrai primeiro trecho YYYY-MM-DD se presente
            m = re.search(r"(\d{4}-\d{2}-\d{2})", s)
            if m:
                try:
                    return datetime.strptime(m.group(1), "%Y-%m-%d")
                except Exception:
                    pass

        return None

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

    def extract_investment_statistics(self, gazettes: List[Dict[str, Any]], selected_category: str = None) -> Dict[str, Any]:
        total_invested = 0.0
        category_totals = {cat: 0.0 for cat in CATEGORY_MAP.keys()}
        category_totals["Outros"] = 0.0

        money_re = re.compile(r"(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})")
        
        # Preparar intervalo de datas para decidir agrupamento (mês vs ano)
        parsed_dates = [self._parse_date(g.get('date')) for g in gazettes if g.get('date')]
        parsed_dates = [d for d in parsed_dates if d is not None]
        
        # SEMPRE calcular série temporal (não apenas para selected_category)
        group_by = 'month'  # default
        if parsed_dates:
            start_date = min(parsed_dates)
            end_date = max(parsed_dates)
            delta_days = (end_date - start_date).days
            # Até um ano (366 dias) -> agrupar por mês, senão por ano
            group_by = 'month' if delta_days <= 366 else 'year'

        # Acumuladores para série temporal
        ts_acc = defaultdict(float)  # Para valores monetários
        count_acc = defaultdict(int)  # Para contagem de publicações

        for gazette in gazettes:
            gazette_date = self._parse_date(gazette.get('date'))
            
            # Calcular bucket de tempo
            time_bucket = None
            if gazette_date:
                if group_by == 'month':
                    time_bucket = f"{gazette_date.year}-{gazette_date.month:02d}"
                else:
                    time_bucket = f"{gazette_date.year}"
                # Sempre contar publicação
                count_acc[time_bucket] += 1

            # PRIORIDADE: texto completo via txt_url > excerpts
            text_content = ""
            txt_url = gazette.get("txt_url")
            
            # Tentar baixar texto completo se disponível
            if txt_url:
                full_text = self._download_full_text(txt_url)
                if full_text:
                    text_content = full_text
            
            # Fallback para excerpts se não conseguiu texto completo
            if not text_content and "excerpts" in gazette and gazette["excerpts"]:
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
                # Aumentar janela de contexto para 500 chars para capturar mais informação
                context_window = text_content[max(0, start_index - 500) : min(len(text_content), end_index + 500)].lower()
                
                if any(term in context_window for term in EXCLUSION_TERMS):
                    continue
                
                # FILTRO PRINCIPAL: Só incluir se "software" ou "robótica" estiver no contexto
                has_software = bool(re.search(r'\bsoftware\b', context_window))
                has_robotica = bool(re.search(r'\brobótica\b', context_window))
                
                if not has_software and not has_robotica:
                    continue  # Pular valores sem relação com software/robótica
                
                # SUBCATEGORIZAÇÃO: Verificar subcategorias específicas
                found_category = None
                for category, keywords in CATEGORY_MAP.items():
                    if category == "Outros":
                        continue  # Verificar "Outros" por último
                    for keyword in keywords:
                        pattern = r'\b' + re.escape(keyword) + r'\b'
                        if re.search(pattern, context_window):
                            found_category = category
                            break 
                    if found_category:
                        break
                
                # Fallback para categoria principal
                if not found_category:
                    found_category = "Robótica" if has_robotica else "Outros"

                total_invested += clean_value
                category_totals[found_category] += clean_value

                # Acumular na série temporal
                if time_bucket:
                    ts_acc[time_bucket] += clean_value

        total_invested = round(total_invested, 2)
        category_totals = {k: round(v, 2) for k, v in category_totals.items()}
        
        # Série temporal de investimentos (ordenada cronologicamente)
        investments_by_period = {k: round(v, 2) for k, v in sorted(ts_acc.items())}
        
        # Série temporal de contagem de publicações (ordenada cronologicamente)
        publications_by_period = {k: v for k, v in sorted(count_acc.items())}

        result = {
            "total_invested": total_invested,
            "investments_by_category": category_totals,
            "investments_by_period": investments_by_period,
            "publications_by_period": publications_by_period,
            "period_grouping": group_by  # 'month' ou 'year'
        }

        # Manter compatibilidade com selected_category
        if selected_category:
            result["time_series"] = investments_by_period

        return result

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