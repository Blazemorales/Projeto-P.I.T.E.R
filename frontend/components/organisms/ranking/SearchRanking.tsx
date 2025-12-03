"use client";

import React, { useCallback, useState, useMemo } from "react";
import { useGazetteSearch } from "@/hooks/useGazetteSearch";
import { SearchForm } from "@/components/molecules/ranking/SearchForm";
import Navbar_sec from "@/components/atoms/Navbar_sec";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Cores para subcategorias
const CATEGORY_COLORS: Record<string, string> = {
  'Educacao': '#3B82F6',
  'Capacitacao': '#22C55E',
  'Servidor': '#A855F7',
  'Cloud/Nuvem': '#F59E0B',
  'Hospedagem': '#EC4899',
  'Rede': '#06B6D4',
  'Backup': '#8B5CF6',
  'Data Center': '#10B981',
  'Gestao': '#F97316',
  'ERP': '#6366F1',
  'Financeiro': '#14B8A6',
  'Robotica': '#EF4444',
  'Outros': '#6B7280',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SubcategoryData {
  name: string;
  value: number;
  color: string;
}

export default function SearchRanking() {
  const gazetteSearch = useGazetteSearch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [gazettes, setGazettes] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [totalInvested, setTotalInvested] = useState(0);

  const handleSearch = useCallback(async () => {
    const { municipio, categoria, dataInicio, dataFim } = gazetteSearch.filters;

    if (!municipio) {
      setError('Selecione um municipio');
      return;
    }

    if (!categoria) {
      setError('Selecione uma categoria');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar diarios
      const params = new URLSearchParams({
        territory_ids: municipio,
        size: '100',
      });

      if (categoria === 'robotica') {
        params.append('querystring', 'robótica');
      } else if (categoria === 'software') {
        params.append('querystring', 'software');
      }

      if (dataInicio) params.append('published_since', dataInicio);
      if (dataFim) params.append('published_until', dataFim);

      const response = await fetch(`${API_BASE_URL}/api/v1/gazettes?${params}`);
      
      if (!response.ok) throw new Error('Erro ao buscar diarios');

      const data = await response.json();
      const fetchedGazettes = data.gazettes || [];
      setGazettes(fetchedGazettes);

      // Salvar e obter estatisticas diretamente da resposta
      const saveResponse = await fetch(`${API_BASE_URL}/api/v1/save_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gazettes: fetchedGazettes,
          filters: { territory_id: municipio, dataInicio, dataFim, categoria }
        })
      });

      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        console.log('Dados recebidos do save_search:', saveData);
        
        // Usar dados diretamente da resposta
        const total = saveData.total_invested || 0;
        setTotalInvested(total);
        
        const categories = saveData.investments_by_category || {};
        
        // Converter para array, IGNORAR "Outros" e ordenar
        const categoryArray: SubcategoryData[] = Object.entries(categories)
          .filter(([name, value]) => (value as number) > 0 && name !== 'Outros')
          .map(([name, value]) => ({
            name,
            value: value as number,
            color: CATEGORY_COLORS[name] || '#6B7280'
          }))
          .sort((a, b) => b.value - a.value);

        console.log('Subcategorias processadas:', categoryArray);
        setSubcategories(categoryArray);
      } else {
        console.error('Erro ao salvar busca:', await saveResponse.text());
      }

      setShowResults(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar busca');
    } finally {
      setLoading(false);
    }
  }, [gazetteSearch.filters]);

  const handleNewSearch = () => {
    setShowResults(false);
    setSubcategories([]);
    setGazettes([]);
    setTotalInvested(0);
  };

  // Top 3 subcategorias
  const top3 = useMemo(() => subcategories.slice(0, 3), [subcategories]);

  // Dados do grafico (top 3)
  const chartData = useMemo(() => {
    return top3.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [top3]);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.rank}o {data.name}</p>
          <p className="text-blue-600">R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  // Tela de busca
  if (!showResults) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center mt-8">
          <div className="w-full mx-auto bg-transparent p-6">
            <Navbar_sec />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-5">Ranking de Investimentos</h1>
            <p className="text-[#01161E]">
              Veja as subcategorias mais investidas no seu municipio
            </p>
          </div>

          <div className="max-w-3xl bg-transparent p-6 mb-6 w-full">
            <div className="space-y-6">
              <SearchForm
                filters={gazetteSearch.filters}
                onFilterChange={gazetteSearch.updateFilters}
                onSearch={handleSearch}
                loading={loading}
              />
              {error && (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <div className="bg-[#EFF6E0] rounded-xl p-6 w-96 mt-8">
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#01161E] mb-2">
                      Dicas de Busca
                    </div>
                    <ul className="text-sm text-[#01161E] list-disc text-left pl-6 space-y-1">
                      <li>Experimente um periodo de tempo mais amplo</li>
                      <li>Teste outras categorias tecnologicas</li>
                      <li>Verifique se ha publicacoes recentes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Processando ranking...</p>
        </div>
      </div>
    );
  }

  // Dashboard de ranking
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-green-300 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Titulo */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Ranking de Investimentos</h1>

        {/* Total investido */}
        <div className="bg-blue-600 rounded-xl p-4 mb-6 text-white text-center">
          <p className="text-sm opacity-80">Total Investido</p>
          <p className="text-3xl font-bold">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Top 3 - Podio */}
        <div className="bg-blue-500 rounded-xl p-4 mb-6">
          <p className="text-white text-sm mb-4">Top 3 subcategorias mais investidas</p>
          <div className="bg-blue-400 rounded-lg p-4">
            <div className="flex justify-center items-end gap-4">
              {/* 2o Lugar */}
              {top3[1] && (
                <div className="flex flex-col items-center">
                  <div className="bg-gray-300 rounded-lg p-4 w-32 text-center">
                    <p className="text-sm text-gray-600">2o Lugar</p>
                    <p className="text-lg font-bold">R$ {(top3[1].value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs mt-1 font-medium">{top3[1].name}</p>
                  </div>
                </div>
              )}
              
              {/* 1o Lugar */}
              {top3[0] && (
                <div className="flex flex-col items-center -mt-8">
                  <div className="bg-yellow-400 rounded-lg p-4 w-36 text-center shadow-lg">
                    <p className="text-sm">1o Lugar</p>
                    <p className="text-xl font-bold">R$ {(top3[0].value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs mt-1 font-medium">{top3[0].name}</p>
                  </div>
                </div>
              )}
              
              {/* 3o Lugar */}
              {top3[2] && (
                <div className="flex flex-col items-center">
                  <div className="bg-orange-300 rounded-lg p-4 w-32 text-center">
                    <p className="text-sm">3o Lugar</p>
                    <p className="text-lg font-bold">R$ {(top3[2].value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs mt-1 font-medium">{top3[2].name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grafico de ranking */}
        <div className="bg-green-500 rounded-xl p-4 mb-6">
          <p className="text-white text-sm mb-4">Investimento por subcategoria</p>
          <div className="bg-white rounded-lg p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toString()} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Nenhum dado disponivel para o grafico
              </div>
            )}
          </div>
        </div>

        {/* Botoes */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleNewSearch}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
          >
            Nova busca
          </button>
          {gazettes.length > 0 && (
            <button
              onClick={() => {
                // Abrir diarios em nova aba
                const urls = gazettes.slice(0, 5).map(g => g.url).filter(Boolean);
                urls.forEach(url => window.open(url, '_blank'));
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
            >
              Fontes ({gazettes.length} diarios)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
