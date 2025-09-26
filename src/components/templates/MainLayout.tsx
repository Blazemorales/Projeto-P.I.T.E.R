// CAMADA 1: APRESENTAÇÃO - TEMPLATE
// Template principal da aplicação P.I.T.E.R

'use client';

import React, { ReactNode } from 'react';
import { Header } from '@/components/organisms/Header';
import { FilterPanel } from '@/components/organisms/FilterPanel';
import {
  SearchFilters,
  AllowedState,
  AllowedCity,
  AllowedCategory,
} from '@/types';

interface MainLayoutProps {
  children: ReactNode;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
  onSearch?: () => void;
  isLoading?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo no topo */}
      <Header />

      {/* Container principal com compensação do header */}
      <div className="pt-16">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Painel de filtros à esquerda */}
          <aside className="w-80 bg-white shadow-card border-r border-gray-200 overflow-y-auto p-4">
            <FilterPanel
              filters={
                filters || {
                  estado: 'Goiás' as AllowedState,
                  municipio: 'Goiânia' as AllowedCity,
                  categoria: 'investimentos em pesquisa' as AllowedCategory,
                  dataInicio: '2024-01-01',
                  dataFim: new Date().toISOString().split('T')[0],
                }
              }
              onFiltersChange={onFiltersChange || (() => {})}
              onSearch={onSearch}
              isLoading={isLoading}
            />
          </aside>

          {/* Área principal de conteúdo à direita */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
