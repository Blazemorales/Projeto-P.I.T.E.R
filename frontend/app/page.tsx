'use client';

import React, { useState } from 'react';
import Navbar_sec from '@/components/atoms/Navbar_sec';
import { SearchForm } from '@/components/molecules/search/SearchForm';
import { GazetteCard } from '@/components/molecules/GazetteCard';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import SugestaoPesquisa from '@/components/atoms/SugestaoPesquisa';
import DashboardPesquisa from '@/components/pages/dashboard-pesquisa';

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const {
    results,
    loading,
    error,
    total,
    filters,
    updateFilters,
    search,
    clearResults,
    clearError,
  } = useGazetteSearch();

  const handleSearch = async () => {
    await search();
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    clearResults();
    clearError();
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-6 py-12">
        {!showResults ? (
          // Página de busca inicial
          <div>
            <div className="w-full mx-auto bg-transparent p-6">
              <Navbar_sec />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl text-[#01161E] font-bold text-gray-900 mb-5">
                Buscar Diários Oficiais
              </h1>
              <p className="text-[#01161E]">
                Encontre investimentos em tecnologia educacional nos diários oficiais de Goiás
              </p>
            </div>
            
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-transparent p-6 mb-0">
                <SearchForm
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onSearch={handleSearch}
                  loading={loading}
                />
              </div>
              <SugestaoPesquisa />
            </div>
          </div>
        ) : (
          // Página de resultados
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col items-center space-y-4">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Resultados da Busca
                </h1>
                <p className="text-gray-600 mt-1">
                  {total > 0 ? `${total} diários oficiais encontrados` : 'Nenhum resultado encontrado'}
                </p>
              </div>

              <button
                onClick={handleNewSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Nova Busca
              </button>

              <a
                href="/dashboard_pesquisa"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Gerar Relatório
              </a>

            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Buscando diários oficiais...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((gazette, index) => (
                  <GazetteCard key={`${gazette.territory_id}-${gazette.date}-${index}`} gazette={gazette} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  Nenhum diário oficial encontrado com os filtros selecionados.
                </div>
                <p className="text-gray-400 mt-2">
                  Tente ajustar os critérios de busca.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}