# 🔍 Serviço de Comparação — Projeto P.I.T.E.R.

O módulo **ComparisonService** permite comparar dois cenários diferentes de análise de gastos públicos, baseados em *território* e *intervalo de datas*, utilizando o pipeline principal do projeto.

---

## 📌 Objetivo do Serviço

A página de comparação tem como objetivo:

- Rodar o **pipeline completo** para dois diferentes cenários (A e B)
- Comparar os resultados financeiros
- Identificar qual cenário teve maior investimento total
- Gerar um arquivo `.json` com o resumo da comparação
- Disponibilizar o resultado para o frontend de forma simples

---

## 🧠 Como funciona a lógica da comparação

A comparação utiliza um único critério de vitória:

### **🏆 Quem “ganha”?**  
👉 O cenário que tiver **maior valor de `total_invested`** no resultado do pipeline.

Fórmula usada:

```python
total_a = result_a["data"]["total_invested"]
total_b = result_b["data"]["total_invested"]
Regras:

Se total_a > total_b → A vence

Se total_b > total_a → B vence

Se forem iguais → Empate

Também é calculada a diferença absoluta:

python
Copiar código
diff = abs(total_a - total_b)
⚙️ Fluxo interno do serviço
O método principal é:

python
Copiar código
async def compare_scenarios(...)
E ele realiza 7 etapas:

Recebe os parâmetros dos dois cenários:

território (A e B)

datas iniciais e finais

palavras-chave (opcional)

Executa o pipeline completo para A

Executa o pipeline completo para B

Extrai de cada resultado:

total_invested

Aplica a lógica de comparação

Monta um JSON de resposta:

dados completos do cenário A

dados completos do cenário B

resumo (diferença, vencedor, timestamp)

Salva o resultado em:

bash
Copiar código
exports/latest_comparison.json
Também gera um arquivo histórico nomeado automaticamente, exemplo:

pgsql
Copiar código
compare_Brasilia_vs_Taguatinga_20251130_175955.json
📁 Estrutura do JSON retornado
json
Copiar código
{
  "scenario_a": { ... },
  "scenario_b": { ... },
  "summary": {
    "investment_difference": 120000.50,
    "winner": "A",
    "generated_at": "2025-11-30T17:59:55"
  }
}
🗂 Localização dos arquivos
markdown
Copiar código
backend/
 └── services/
      └── api/
           └── comparison/
                ├── comparison_service.py
                ├── __init__.py
                └── README.md   ← (este arquivo)
🔧 Dependências utilizadas
run_analysis_pipeline
→ responsável por rodar coleta, limpeza, IA, estatísticas etc.

save_json_file
→ salva o resultado em exports/ e gerencia o arquivo "latest".

🧪 Testabilidade
Para testar este módulo, você pode criar um arquivo:

bash
Copiar código
backend/tests/test_comparison.py
E simular:

vitória de A

vitória de B

empate

✨ Observações importantes
O serviço não sobrescreve a pesquisa principal.

A comparação é independente e sempre salva sua própria saída.

Se a lógica de negócios mudar no futuro, basta alterar o bloco:

python
Copiar código
total_a = ...
total_b = ...
winner = ...
🚀 Status
✅ Serviço funcionando
🏗 Pronto para futuras expansões (novos critérios de comparação)

Projeto P.I.T.E.R — Análise e transparência de gastos públicos.

yaml
Copiar código

---

# 🎉 Agora é só criar o arquivo e commitar!

## ✔️ Comando pra criar
No VS Code, crie o arquivo:

backend/services/api/comparison/README.md

bash
Copiar código

Cole o conteúdo.

## ✔️ Comandos de commit:

```bash
git add backend/services/api/comparison/README.md
git commit -m "docs: adiciona README da lógica de comparação"
git push origin main