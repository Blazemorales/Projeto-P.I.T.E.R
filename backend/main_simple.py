from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import uvicorn
import os
import json
from pathlib import Path

app = FastAPI(
    title="P.I.T.E.R API",
    description="Plataforma de Integração e Transparência em Educação e Recursos",
    version="1.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"project": "P.I.T.E.R", "status": "Online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

# --- ENDPOINT: Listar arquivos de data_output ---
@app.get("/data_output")
async def list_data_output():
    """
    Lista todos os arquivos JSON salvos em data_output
    """
    try:
        data_dir = Path(__file__).parent / "data_output"
        
        if not data_dir.exists():
            return {
                "files": [],
                "total": 0,
                "message": "Nenhum arquivo encontrado"
            }
        
        files = []
        for file in sorted(data_dir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                
                files.append({
                    "name": file.name,
                    "size": file.stat().st_size,
                    "modified": file.stat().st_mtime,
                    "type": "analysis" if "analysis" in file.name else "comparison" if "compare" in file.name else "search",
                    "territory_id": content.get("meta", {}).get("source_territory", "unknown"),
                    "data": content
                })
            except Exception as e:
                files.append({
                    "name": file.name,
                    "size": file.stat().st_size,
                    "modified": file.stat().st_mtime,
                    "error": str(e)
                })
        
        return {
            "files": files,
            "total": len(files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT: Obter arquivo específico ---
@app.get("/data_output/{filename}")
async def get_data_output_file(filename: str):
    """
    Obtém um arquivo específico de data_output
    """
    try:
        # Segurança: validar nome do arquivo
        if ".." in filename or "/" in filename:
            raise HTTPException(status_code=400, detail="Nome de arquivo inválido")
        
        file_path = Path(__file__).parent / "data_output" / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {filename}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
