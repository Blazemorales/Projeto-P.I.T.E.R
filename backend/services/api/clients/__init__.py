# backend/services/api/clients/__init__.py
"""
Módulo de clientes de API para o P.I.T.E.R

Exporta os clientes para comunicação com APIs externas:
- querido_diario_client: Cliente para API Querido Diário
- spacy_api_client: Cliente para processamento NLP com spaCy
- gemini_client: Cliente para API Gemini (Google AI)
"""

from . import querido_diario_client
from . import spacy_api_client

# Tenta importar gemini_client (pode falhar se API key não estiver configurada)
try:
    from . import gemini_client
except ImportError:
    gemini_client = None

__all__ = [
    'querido_diario_client',
    'spacy_api_client',
    'gemini_client',
]

