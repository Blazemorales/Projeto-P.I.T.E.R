import re

def clean_text_for_ia(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:10000]

def pre_filter_spacy_input(raw_text: str) -> str:
    """
    Algoritmo de pré-filtragem avançado.
    """
    if not raw_text:
        return ""

    # 1. Limpeza básica (HTML)
    text = re.sub(r'<[^>]+>', ' ', raw_text)

    # 2. Padrões de lixo (Regex)
    full_line_junk_patterns = re.compile(
        r'^(Página \d+ de \d+)$'
        r'|^(Diário Oficial (do Município|Nº)[\s\d\w]+)$'
        r'|^(Assinado Digitalmente (por|via):.*)$'
        r'|^(\d{1,2}[/\.]\d{1,2}[/\.]\d{2,4})$'
        r'|^\s*[\.\-\_=\*]{3,}.*$' 
        r'|^(Publique-se|Cumpra-se|Resolve:)$'
        , re.IGNORECASE
    )

    partial_junk_patterns = re.compile(
        r'\bArt\. \d+º?'
        r'|\b§ \d+º?'
        r'|\bInciso [IVXLCDM]+\b'
        r'|\d{3}\.\d{3}\.\d{3}-\d{2}'
        r'|\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}'
        r'|\b[A-Fa-f0-9]{20,}\b'
        r'|Data: \d{1,2}[/\.]\d{1,2}[/\.]\d{2,4}'
        , re.IGNORECASE
    )

    cleaned_lines = []
    for line in text.splitlines():
        line = line.strip()

        if not line: continue
        if full_line_junk_patterns.match(line): continue
            
        if (line.upper() == line) and any(c.isalpha() for c in line) and len(line) < 100:
            continue

        line = partial_junk_patterns.sub('', line)
        line = line.strip()

        # --- CORREÇÃO: Limite relaxado para 5 (era 15) ---
        if len(line) < 5:
            continue
        # ------------------------------------------------

        cleaned_lines.append(line)

    final_text = " ".join(cleaned_lines)
    final_text = re.sub(r'\s+', ' ', final_text).strip()
    
    return final_text[:10000]
