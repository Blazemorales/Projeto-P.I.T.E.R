// CAMADA 1: APRESENTAÇÃO - ORGANISM
// Seções complexas - Painel de Filtros estilizado (lado esquerdo da tela)

'use client';

import React from 'react';
import { FilterGroup } from '../molecules/FilterGroup';
import { Button } from '../atoms/Button';
import {
  SearchFilters,
  AllowedState,
  AllowedCity,
  AllowedCategory,
} from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch?: () => void;
  isLoading?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  // Valores de fallback para segurança
  const safeFilters = filters || {
    estado: 'Goiás' as AllowedState,
    municipio: 'Goiânia' as AllowedCity,
    categoria: 'investimentos em pesquisa' as AllowedCategory,
    dataInicio: '2024-01-01',
    dataFim: new Date().toISOString().split('T')[0],
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    onFiltersChange({
      ...safeFilters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-card space-y-6">
      {/* Título */}
      <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>

      {/* Grupo de filtros */}
      <FilterGroup
        estado={safeFilters.estado}
        municipio={safeFilters.municipio}
        categoria={safeFilters.categoria}
        dataInicio={safeFilters.dataInicio}
        dataFim={safeFilters.dataFim}
        onEstadoChange={(value) => updateFilter('estado', value)}
        onMunicipioChange={(value) => updateFilter('municipio', value)}
        onCategoriaChange={(value) => updateFilter('categoria', value)}
        onDataInicioChange={(value) => updateFilter('dataInicio', value)}
        onDataFimChange={(value) => updateFilter('dataFim', value)}
      />

      {/* Botão */}
      <div className="pt-2">
        <Button
          onClick={onSearch}
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Pesquisando...' : 'Pesquisar'}
        </Button>
      </div>
    </div>
  );
};
