 'use client';

import React from 'react';
import { Select } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { MUNICIPALITIES, CATEGORIES, SearchFilters } from '@/types';

interface SearchFormProps {
  leftFilters: SearchFilters;
  rightFilters: SearchFilters;
  onLeftChange: (filters: Partial<SearchFilters>) => void;
  onRightChange: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  leftFilters,
  rightFilters,
  onLeftChange,
  onRightChange,
  onSearch,
  loading = false,
}) => {
  return (
    <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-md space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
          <Select
            label="Município 1"
            options={MUNICIPALITIES}
            value={leftFilters.municipio}
            onChange={(value) => onLeftChange({ municipio: value })}
            placeholder="Selecione o município"
            required
            id="municipio1"
          />

        <Select
          label="Município 2"
          options={MUNICIPALITIES}
          value={rightFilters.municipio}
          onChange={(value) => onRightChange({ municipio: value })}
          placeholder="Selecione o município"
          required
          id="municipio2"
        />

        <Input
          type="date"
          label="De"
          value={leftFilters.dataInicio}
          onChange={(value) => onLeftChange({ dataInicio: value })}
          id="dataInicio_left"
        />

        <Input
          type="date"
          label="Até"
          value={leftFilters.dataFim}
          onChange={(value) => onLeftChange({ dataFim: value })}
          id="dataFim_left"
        />
        <Select
            label="Categoria"
            options={CATEGORIES}
            value={leftFilters.categoria}
            onChange={(value) => onLeftChange({ categoria: value as SearchFilters['categoria'] })}
            placeholder="Selecione a categoria"
            required
            id="categoria_left"
          />
      </div>
      <div className="flex justify-center pt-4">
        <Button
          onClick={onSearch}
          disabled={loading}
          size="lg"
          className="px-8"
        >
          {loading ? 'Buscando...' : 'Comparar'}
        </Button>
      </div>
    </div>
  );
};