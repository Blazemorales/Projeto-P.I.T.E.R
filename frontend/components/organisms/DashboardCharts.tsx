/**
 * Dashboard de Investimentos - Componente principal
 * Exibe visualizações dos dados de investimentos em diários oficiais
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Tipos
interface DashboardData {
  meta: {
    source_territory: string;
    period: string;
    search_keywords: string;
    generated_at: string;
    date_range_start?: string;
    date_range_end?: string;
  };
  data: {
    total_invested: number;
    investments_by_category: Record<string, number>;
    investments_by_period?: Record<string, number>;
    publications_by_period?: Record<string, number>;
    period_grouping?: 'month' | 'year';
    total_entities?: number;
    total_gazettes?: number;
  };
  gazettes?: any[];
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

const PIE_COLORS = ['#3B82F6', '#22C55E', '#A855F7', '#F97316', '#EC4899', '#EAB308'];

export default function DashboardCharts() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [territoryName, setTerritoryName] = useState<string>('');

  // Carregar dados do backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/data_output`);

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do backend');
        }

        const result = await response.json();

        if (!result.files || result.files.length === 0) {
          throw new Error('Nenhum dado de análise encontrado. Faça uma busca primeiro.');
        }

        // Pegar o arquivo mais recente
        const sortedFiles = result.files
          .filter((f: any) => f.data && f.data.meta)
          .sort((a: any, b: any) => b.modified - a.modified);

        if (sortedFiles.length === 0) {
          throw new Error('Nenhum arquivo válido encontrado');
        }

        const latestFile = sortedFiles[0];
        const data = latestFile.data as DashboardData;

        console.log('📊 Dados carregados:', data);
        setDashboardData(data);

        // Mapear territory_id para nome
        const territoryMap: Record<string, string> = {
          '5208707': 'Goiânia',
          '5201405': 'Aparecida de Goiânia',
          '5300108': 'Brasília',
        };
        setTerritoryName(territoryMap[data.meta.source_territory] || data.meta.source_territory);

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Dados do gráfico de barras
  const { barChartData, chartTitle, hasMoneyData } = useMemo(() => {
    if (!dashboardData?.data) {
      return { barChartData: [], chartTitle: 'Sem dados', hasMoneyData: false };
    }

    const { investments_by_period, publications_by_period, period_grouping } = dashboardData.data;
    const isMonthly = period_grouping === 'month';
    
    const hasInvestments = investments_by_period && Object.keys(investments_by_period).length > 0 && 
                          Object.values(investments_by_period).some(v => v > 0);
    
    // Combinar todos os períodos de ambas as fontes
    const allPeriods = new Set([
      ...Object.keys(investments_by_period || {}),
      ...Object.keys(publications_by_period || {})
    ]);
    
    if (allPeriods.size === 0) {
      return { barChartData: [], chartTitle: 'Sem dados', hasMoneyData: false };
    }

    // Se tem investimentos, mostrar investimentos (com 0 para períodos sem valor)
    // Senão, mostrar publicações
    const rawData = Array.from(allPeriods).map((period) => {
      let name = period;
      
      if (isMonthly && period.includes('-')) {
        const [, month] = period.split('-');
        name = MONTH_NAMES[month] || month;
      }
      
      const value = hasInvestments 
        ? (investments_by_period?.[period] || 0)
        : (publications_by_period?.[period] || 0);
      
      return { name, value: Math.round(value as number), period, originalValue: Math.round(value as number) };
    });

    rawData.sort((a, b) => a.period.localeCompare(b.period));
    
    // Calcular valor mínimo visível (5% do máximo) para barras muito pequenas
    const maxValue = Math.max(...rawData.map(d => d.value));
    const minVisibleValue = maxValue * 0.05;
    
    // Ajustar valores muito pequenos para serem visíveis, mas manter o valor original para tooltip
    const chartData = rawData.map(d => ({
      ...d,
      displayValue: d.value > 0 && d.value < minVisibleValue ? minVisibleValue : d.value,
    }));

    const title = hasInvestments 
      ? (isMonthly ? 'Investimentos Mensais' : 'Investimentos por Ano')
      : (isMonthly ? 'Publicações por Mês' : 'Publicações por Ano');

    return { barChartData: chartData, chartTitle: title, hasMoneyData: hasInvestments };
  }, [dashboardData]);

  // Dados do gráfico de pizza - usando categorias do backend
  const pieChartData = useMemo((): CategoryData[] => {
    if (!dashboardData?.data?.investments_by_category) {
      return [];
    }

    const categories = dashboardData.data.investments_by_category;
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

    if (total === 0) {
      return [];
    }

    // Usar o nome original da categoria (já vem formatado do backend)
    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name,
        value,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [dashboardData]);

  // Formatar período para exibição
  const formattedPeriod = useMemo(() => {
    if (!dashboardData?.meta?.period) return 'N/A';

    const period = dashboardData.meta.period;
    const match = period.match(/(\d{4})-(\d{2})-(\d{2})\s*(?:a|-)\s*(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]} - ${match[6]}/${match[5]}/${match[4]}`;
    }
    return period.replace(/-/g, '/');
  }, [dashboardData]);

  // Estatísticas
  const totalInvested = dashboardData?.data?.total_invested || 0;
  const totalGazettes = dashboardData?.data?.total_gazettes || dashboardData?.gazettes?.length || 0;
  const avgPerFile = totalGazettes > 0 ? totalInvested / totalGazettes : 0;

  // Formatador de valores
  const formatCurrency = (value: number): string => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatShortCurrency = (value: number): string => {
    if (value === 0) return 'R$ 0,00';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  // Gerar PDF
  const handleGeneratePDF = () => {
    window.print();
  };

  // Tooltip customizado para barras - usa originalValue para mostrar o valor real
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Usar originalValue se disponível (valor real antes do ajuste visual)
      const value = payload[0].payload?.originalValue ?? payload[0].value;
      const formattedValue = hasMoneyData
        ? formatCurrency(value)
        : `${value} publicação(ões)`;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{territoryName || label}</p>
          <p className="text-blue-600">{formattedValue}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">Erro ao carregar dados</p>
          <p className="text-red-500">{error}</p>
          <a
            href="/"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Fazer uma busca
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Investimentos</h1>

        {/* Cards de Estatísticas - Layout horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 - Total Investido (Azul) */}
          <div className="bg-blue-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">Total investido:</p>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {totalInvested > 0 ? formatCurrency(totalInvested) : 'Sem dados'}
            </p>
          </div>

          {/* Card 2 - Período Analisado (Verde) */}
          <div className="bg-green-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">Período Analisado:</p>
            <p className="text-2xl md:text-3xl font-bold mt-2">{formattedPeriod}</p>
              </div>

          {/* Card 3 - Média por Arquivo (Roxo) */}
          <div className="bg-purple-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">
              {totalInvested > 0 ? 'Média por arquivo:' : 'Total de publicações:'}
            </p>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {totalInvested > 0 ? formatShortCurrency(avgPerFile) : totalGazettes}
                </p>
              </div>
        </div>

        {/* Gráficos - Um acima do outro */}
        <div className="space-y-6">
          {/* Gráfico de Barras */}
          <div className="bg-blue-500 rounded-xl p-6">
            <p className="text-white text-sm font-medium mb-4">{chartTitle}:</p>
            <div className="bg-white rounded-lg p-4">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickFormatter={(value) => hasMoneyData ? `${(value/1000).toFixed(0)}K` : value.toString()}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="displayValue"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      activeBar={{ fill: '#1D4ED8' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
      </div>
          </div>

          {/* Gráfico de Pizza */}
          <div className="bg-green-500 rounded-xl p-6">
            <p className="text-white text-sm font-medium mb-4">Investimentos por subcategoria:</p>
            <div className="bg-white rounded-lg p-4">
              {pieChartData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center">
                  {/* Legenda */}
                  <div className="flex flex-col space-y-3 mb-4 md:mb-0 md:mr-6">
                    {pieChartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-gray-700 text-sm font-medium">
                          {entry.name} - {entry.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Gráfico Donut */}
                  <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="percentage"
                          nameKey="name"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Texto central do donut */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-2xl font-bold text-gray-800">100%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>Sem dados de categorias</p>
                    <p className="text-sm mt-2">Os investimentos não foram classificados</p>
                  </div>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Info quando não há dados de investimento */}
        {totalInvested === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <p className="text-yellow-800 font-semibold">ℹ️ Informação</p>
            <p className="text-yellow-700 text-sm mt-2">
              Os diários encontrados não contêm valores monetários identificáveis nos trechos analisados.
              O gráfico de barras está mostrando a <strong>quantidade de publicações</strong> por período.
            </p>
            </div>
          )}

        {/* Botão Gerar PDF */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => window.location.href = '/pesquisar'}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-10 py-3 rounded-full transition-colors shadow-lg"
          >
            Nova busca
          </button>
          <button
            onClick={handleGeneratePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3 rounded-full transition-colors shadow-lg"
          >
            Gerar relatório PDF
          </button>
        </div>
      </div>
    </div>
  );
}
