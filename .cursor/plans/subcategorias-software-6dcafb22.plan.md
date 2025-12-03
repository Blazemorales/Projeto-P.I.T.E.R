<!-- 6dcafb22-eb6f-42d4-8d5f-fe43c50f2540 017da0d8-9d0d-4bf8-81c2-626702fae0c5 -->
# Implementar Subcategorias de Software

## Alterações no Backend

### 1. Atualizar CATEGORY_MAP em [statistics_generator.py](backend/services/processing/statistics_generator.py)

Modificar a estrutura para incluir subcategorias:

```python
CATEGORY_MAP = {
    "Software - Gestão": [
        "gestão", "erp", "administrativo", "financeiro", "contábil"
    ],
    "Software - Infraestrutura": [
        "infraestrutura", "servidor", "cloud", "nuvem", "hospedagem"
    ],
    "Software - Outros": [
        "software"  # Captura software que não se encaixa nas subcategorias acima
    ],
    "Robótica": [
        "robótica"
    ]
}
```

A ordem importa: primeiro verifica Gestão e Infraestrutura, depois "Software - Outros" como fallback.

### 2. Atualizar Frontend em [DashboardCharts.tsx](frontend/components/organisms/DashboardCharts.tsx)

Atualizar o mapeamento de nomes para exibição mais curta no gráfico:

```typescript
const categoryDisplayNames: Record<string, string> = {
  'Software - Gestão': 'Gestão',
  'Software - Infraestrutura': 'Infraestrutura', 
  'Software - Outros': 'Software',
  'Robótica': 'Robótica',
  'Outros': 'Outros'
};
```

## Resultado Esperado

O gráfico de pizza mostrará:

- **Gestão**: 60% (R$ 2.627.859 - transportes coletivos)
- **Infraestrutura**: 40% (R$ 1.800.000 - sistema de saúde com hospedagem)