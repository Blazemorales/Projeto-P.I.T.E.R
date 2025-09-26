// CAMADA 1: APRESENTAÇÃO - PAGE
// Página principal do P.I.T.E.R - Inspirada no protótipo Figma

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { SearchFilters, InvestmentData, STATES, CITIES, CATEGORIES } from '@/types';
import ResultCard from '@/components/organisms/ResultCard';

export default function HomePage() {
  const [filters, setFilters] = useState<SearchFilters>({
    estado: STATES.GOIAS,
    municipio: CITIES.GOIANIA,
    categoria: CATEGORIES.INVESTIMENTOS_PESQUISA,
    dataInicio: '2024-01-01',
    dataFim: new Date().toISOString().split('T')[0]
  });

  const [data, setData] = useState<InvestmentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const baseData = [
        { month: '2024-01', baseCount: 3 },
        { month: '2024-02', baseCount: 7 },
        { month: '2024-03', baseCount: 5 },
        { month: '2024-04', baseCount: 9 },
        { month: '2024-05', baseCount: 12 },
      ];

      const multiplier =
        filters.categoria === CATEGORIES.INVESTIMENTOS_PESQUISA ? 1.2 : 0.8;
      const cityMultiplier = filters.municipio === CITIES.GOIANIA ? 1.5 : 1.0;

      const simulatedData: InvestmentData[] = baseData.map(item => ({
        month: item.month,
        count: Math.round(item.baseCount * multiplier * cityMultiplier),
        category: filters.categoria,
      }));

      setData(simulatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar dados: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    performSearch();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      filters={filters}
      onFiltersChange={updateFilters}
      onSearch={performSearch}
      isLoading={isLoading}
    >
      <div className="space-y-10">
        {/* HERO */}
        <section className="text-center bg-white p-8 rounded-2xl shadow">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Plataforma P.I.T.E.R
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitoramento de investimentos em tecnologias educacionais 
            nos diários oficiais municipais.
          </p>
        </section>

        {/* RESULTADOS */}
        <section>
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando resultados...</p>
          ) : data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((item, idx) => (
                <ResultCard
                  key={idx}
                  item={item}
                  municipio={filters.municipio}
                  estado={filters.estado}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Nenhum resultado encontrado.</p>
          )}
        </section>

        {/* ESTATÍSTICAS */}
        {!isLoading && data.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h3 className="text-sm font-medium text-gray-600">Total</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                {data.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h3 className="text-sm font-medium text-gray-600">Período</h3>
              <p className="text-lg font-semibold mt-2">{data.length} meses</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h3 className="text-sm font-medium text-gray-600">Média Mensal</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {Math.round(
                  data.reduce((sum, item) => sum + item.count, 0) / data.length
                )}
              </p>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
