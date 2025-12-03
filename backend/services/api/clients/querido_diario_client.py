import httpx
import logging
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, date

# URL Direta da API
QUERIDO_DIARIO_API_URL = "https://api.queridodiario.ok.org.br"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FilterParams(BaseModel):
    territory_ids: Optional[str] = None
    published_since: Optional[date] = None
    published_until: Optional[date] = None
    querystring: Optional[str] = None
    size: Optional[int] = 10

async def fetch_gazettes(territory_id: str, since: str, until: str, keywords: str = None) -> Optional[Dict[Any, Any]]:
    """
    Busca diários usando PAGINAÇÃO (Varredura) e filtro manual de datas.
    Essencial para encontrar diários específicos quando a API prioriza relevância.
    """
    url = f"{QUERIDO_DIARIO_API_URL}/gazettes/"
    query_term = keywords if keywords else "educação tecnologia informática"
    
    # --- CONFIGURAÇÃO DA VARREDURA ---
    # Lê até 5 páginas (500 documentos) para tentar achar a data certa no meio da relevância
    PAGES_TO_SCAN = 5
    PAGE_SIZE = 100
    
    collected_gazettes = []
    
    try:
        target_start = datetime.strptime(since, "%Y-%m-%d").date()
        target_end = datetime.strptime(until, "%Y-%m-%d").date()
    except ValueError as e:
        logger.error(f"❌ Datas inválidas: {since} - {until} | Erro: {e}")
        return {"gazettes": [], "total_gazettes": 0}

    logger.info(f"🕵️ INICIANDO VARREDURA: '{query_term}' de {since} até {until}")
    logger.info(f"📅 Intervalo alvo: {target_start} até {target_end}")

    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        for page in range(PAGES_TO_SCAN):
            params = {
                "territory_ids": territory_id,
                "since": since,
                "until": until,
                "size": PAGE_SIZE,
                "offset": page * PAGE_SIZE, # Pula para a próxima página
                "querystring": query_term
            }
            
            try:
                response = await client.get(url, params=params)
                
                if response.status_code != 200:
                    logger.warning(f"  ⚠️ Erro na pág {page+1}: HTTP {response.status_code}")
                    break 

                data = response.json()
                batch = data.get("gazettes", [])
                
                if not batch:
                    break # Acabaram os resultados da API

                # --- FILTRO MANUAL DE DATA ---
                count_in_batch = 0
                for gazette in batch:
                    raw_date = gazette.get("date")
                    if not raw_date:
                        logger.warning(f"  ⚠️ Diário sem data: {gazette.get('territory_id')} - {gazette.get('edition')}")
                        continue

                    try:
                        g_date = datetime.strptime(str(raw_date)[:10], "%Y-%m-%d").date()

                        # Log para debug
                        is_in_range = target_start <= g_date <= target_end
                        if not is_in_range:
                            logger.debug(f"  🚫 FILTRADO: {g_date} não está entre {target_start} e {target_end}")

                        # Só guarda se for EXATAMENTE do período pedido
                        if is_in_range:
                            collected_gazettes.append(gazette)
                            count_in_batch += 1
                            logger.debug(f"  ✅ INCLUÍDO: {g_date} está no período")

                    except ValueError as e:
                        logger.warning(f"  ⚠️ Data inválida: {raw_date} - {e}")
                        continue
                
                # Opcional: Log para ver o progresso
                # logger.info(f"  - Pág {page+1}: {len(batch)} baixados, {count_in_batch} úteis.")

            except Exception as e:
                logger.error(f"  ❌ Erro na requisição da pág {page}: {e}")
                break
    
    total_found = len(collected_gazettes)
    logger.info(f"✅ VARREDURA CONCLUÍDA. Encontrados {total_found} diários válidos no período.")
    
    return {
        "gazettes": collected_gazettes,
        "total_gazettes": total_found
    }

# --- Wrapper Class (Compatibilidade) ---
class QueridoDiarioClient:
    BASE_URL = f"{QUERIDO_DIARIO_API_URL}/gazettes/"

    async def fetch_gazettes(self, filters: FilterParams) -> Dict[str, Any]:
        params = filters.dict(exclude_none=True)
        if 'published_since' in params: params['since'] = params.pop('published_since').strftime("%Y-%m-%d")
        if 'published_until' in params: params['until'] = params.pop('published_until').strftime("%Y-%m-%d")

        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            response = await client.get(self.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()
    
    async def search_gazettes(self, territory_id: str, start_date: str, end_date: str, keywords: list):
        query = " ".join(keywords) if keywords else None
        return await fetch_gazettes(str(territory_id), str(start_date), str(end_date), query)