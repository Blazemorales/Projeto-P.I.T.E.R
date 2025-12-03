'use client';

import React from 'react';
import { Select } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { MUNICIPALITIES, CATEGORIES, SearchFilters } from '@/types';

interface SearchFormProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFilterChange,
  onSearch,
  loading = false,
}) => {
  return (
    <div className="bg-[#F0EBD8] p-6 rounded-lg shadow-md space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Municipio"
          options={MUNICIPALITIES}
          value={filters.municipio}
          onChange={(value) => onFilterChange({ municipio: value })}
          placeholder="Selecione um municipio"
          required
          id="municipio"
        />

        <Input
          type="date"
          label="De"
          value={filters.dataInicio}
          onChange={(value) => onFilterChange({ dataInicio: value })}
          id="dataInicio"
        />

        <Input
          type="date"
          label="Ate"
          value={filters.dataFim}
          onChange={(value) => onFilterChange({ dataFim: value })}
          id="dataFim"
        />
        
        <Select
          label="Categoria"
          options={CATEGORIES}
          value={filters.categoria}
          onChange={(value) => onFilterChange({ categoria: value as SearchFilters['categoria'] })}
          placeholder="Selecione a categoria"
          required
          id="categoria"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onSearch}
          disabled={loading}
          size="lg"
          className="px-8"
        >
          {loading ? 'Processando...' : 'Rankear'}
        </Button>
      </div>
    </div>
  );
};
