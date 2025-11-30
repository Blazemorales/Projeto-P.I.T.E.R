# backend/services/api/clients/gemini_client.py
import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv
from pathlib import Path

# --- CORREÇÃO DE CAMINHO ---
# Identifica o caminho absoluto deste arquivo e sobe 3 níveis para achar a pasta 'backend'
# Estrutura: backend/services/api/clients/gemini_client.py -> parents[3] = backend/
env_path = Path(__file__).resolve().parents[3] / '.env'
load_dotenv(dotenv_path=env_path)

# Tenta pegar a chave
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    print(f"⚠️ AVISO: GEMINI_API_KEY não encontrada. Tentando ler de: {env_path}")

# --- Função de Seleção Dinâmica de Modelo ---
def get_best_gemini_model():
    try:
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if 'gemini' in m.name.lower():
                    available_models.append(m.name)
        
        # Procura modelos Flash
        flash_models = [m for m in available_models if 'flash' in m.lower() and 'legacy' not in m.lower()]
        
        if flash_models:
            flash_models.sort(reverse=True)
            chosen_model = flash_models[0]
            print(f"🤖 Modelo de IA selecionado: {chosen_model}")
            return genai.GenerativeModel(chosen_model)

        # Fallback para Pro
        pro_models = [m for m in available_models if 'pro' in m.lower()]
        if pro_models:
            pro_models.sort(reverse=True)
            return genai.GenerativeModel(pro_models[0])

    except Exception as e:
        print(f"⚠️ Erro ao listar modelos: {e}")

    return genai.GenerativeModel('gemini-2.5-flash')

# --- Função Principal ---
async def analyze_investment_context(text: str) -> Dict[str, Any]:
    if not api_key:
        return {"error": "API Key não configurada"}
    
    if not text or len(text) < 50:
        return {"analysis": "Texto insuficiente para análise."}

    model = get_best_gemini_model()

    prompt = f"""
    Você é um especialista em análise de licitações públicas e tecnologia educacional.
    Analise o seguinte trecho de um Diário Oficial e extraia informações sobre investimentos.
    
    TEXTO:
    "{text[:30000]}"
    
    TAREFA:
    Responda estritamente no formato JSON com os seguintes campos:
    - "resumo_objeto": O que está sendo comprado? (Máx 1 frase)
    - "justificativa": Qual o motivo ou destino da compra? (Ex: "Para escolas rurais", "Modernização de laboratórios")
    - "fornecedor": Nome da empresa vencedora (se houver).
    - "marca_modelo": Há menção de marca/modelo específico? (Sim/Não e qual).
    
    Se não encontrar alguma informação, preencha com "Não identificado".
    Não use markdown (sem ```json), retorne apenas o JSON puro.
    """

    try:
        response = model.generate_content(prompt)
        result_text = response.text.replace("```json", "").replace("```", "").strip()
        
        import json
        try:
            return json.loads(result_text)
        except json.JSONDecodeError:
            return {"raw_analysis": result_text}

    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")
        return {"error": f"Falha na análise qualitativa: {str(e)}"}