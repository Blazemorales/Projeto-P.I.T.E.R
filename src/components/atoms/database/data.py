import json
from pathlib import Path
from typing import Optional


class Dados:
    def __init__(self, cidade, publico, tipo, quantidade, valor, data_aquisicao):
        self.cidade = cidade
        self.publico = publico
        self.tipo = tipo
        self.quantidade = quantidade
        self.valor = valor
        self.data_aquisicao = data_aquisicao

    def armazenagem_investimento(self, filename: Optional[str] = None) -> None:
        if filename is None:
            base = Path(__file__).resolve().parent
            filename = base / 'data.json'
        else:
            filename = Path(filename)

        dados = {
            "cidade": self.cidade,
            "tipo": self.tipo,
            "publico": self.publico,
            "quantidade": self.quantidade,
            "valor": self.valor,
            "data_aquisicao": self.data_aquisicao,
        }

        filename.parent.mkdir(parents=True, exist_ok=True)
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)


def exemplo_escrever() -> None:
    d = Dados(
        cidade='Porto Alegre - RS',
        publico='Pessoas com deficiência visual',
        tipo='Óculos com visão e inteligência artificial',
        quantidade=60,
        valor='R$ 1.039.534,80',
        data_aquisicao='27/02/2024',
    )
    d.armazenagem_investimento()


