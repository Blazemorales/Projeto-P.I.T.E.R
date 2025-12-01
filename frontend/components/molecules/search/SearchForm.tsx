 'use client';

import React from 'react';
import { Select } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { MUNICIPALITIES, CATEGORIES, SearchFilters } from '@/types';

interface SearchFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
}) => {
  return (
    <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-md space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Município"
          options={MUNICIPALITIES}
          value={filters.municipio}
          onChange={(value) => onFiltersChange({ municipio: value })}
          placeholder="Selecione o município"
          required
          id="municipio"
        />

        <Select
          label="Categoria"
          options={CATEGORIES}
          value={filters.categoria}
          onChange={(value) => onFiltersChange({ categoria: value as SearchFilters['categoria'] })}
          placeholder="Selecione a categoria"
          required
          id="categoria"
        />

        <Input
          type="date"
          label="De"
          value={filters.dataInicio}
          onChange={(value) => onFiltersChange({ dataInicio: value })}
          id="dataInicio"
        />

        <Input
          type="date"
          label="Até"
          value={filters.dataFim}
          onChange={(value) => onFiltersChange({ dataFim: value })}
          id="dataFim"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onSearch}
          disabled={loading}
          size="lg"
          className="px-8"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
    </div>
  );
};