# backend/services/api/clients/querido_diario_client.py
import httpx
import logging
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date

# URL correta da API (sem o /api no final da base, pois o endpoint adiciona)
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
    Busca diários na API.
    NOTA: Sem filtro manual de data, a API pode retornar resultados antigos por relevância.
    """
    # Endpoint correto com barra no final
    url = f"{QUERIDO_DIARIO_API_URL}/gazettes/"
    
    query_term = keywords if keywords else "educação tecnologia informática"
    
    params = {
        "territory_ids": territory_id,
        "since": since,
        "until": until,
        "size": 50, 
        "querystring": query_term
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            logger.info(f"Buscando '{query_term}' em {url} ...")
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                logger.error(f"Erro HTTP {response.status_code}: {response.text[:200]}")
                return None

            try:
                data = response.json()
            except ValueError:
                logger.error("API não retornou JSON.")
                return None
            
            # --- VERSÃO ANTERIOR: Retorna tudo o que a API mandou ---
            # Removemos o bloco "if target_start <= g_date..." que estava zerando os resultados.
            
            total = data.get('total_gazettes', 0)
            logger.info(f"✅ Diários encontrados (API): {total}")

            return data
            
    except Exception as e:
        logger.error(f"Erro na busca: {e}")
        return None

# --- CLASSE Wrapper ---
class QueridoDiarioClient:
    BASE_URL = f"{QUERIDO_DIARIO_API_URL}/gazettes/"

    async def fetch_gazettes(self, filters: FilterParams) -> Dict[str, Any]:
        params = filters.dict(exclude_none=True)
        # Ajuste de compatibilidade de parâmetros
        if 'published_since' in params: params['since'] = params.pop('published_since').strftime("%Y-%m-%d")
        if 'published_until' in params: params['until'] = params.pop('published_until').strftime("%Y-%m-%d")

        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            response = await client.get(self.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()
    
    async def search_gazettes(self, territory_id: str, start_date: str, end_date: str, keywords: list):
        query = " ".join(keywords) if keywords else None
        return await fetch_gazettes(str(territory_id), str(start_date), str(end_date), query)