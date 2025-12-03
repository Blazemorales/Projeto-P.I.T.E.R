"use client";

import React, { useState, useMemo } from 'react';
import { SearchForm } from '@/components/molecules/comparing/SearchForm';
import { useGazetteSearch } from '@/hooks/useGazetteSearch';
import Navbar_sec from '@/components/atoms/Navbar_sec';
import SugestaoPesquisa from '@/components/atoms/SugestaoPesquisa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const TERRITORY_NAMES: Record<string, string> = {
  '5208707': 'Goiânia',
  '5201405': 'Aparecida de Goiânia',
  '5201108': 'Anápolis',
  '5300108': 'Brasília',
};

const CATEGORY_LABELS: Record<string, string> = {
  'robotica': 'Robótica Educacional',
  'software': 'Software e Aplicativos',
  '': 'Tecnologia',
};

interface InvestmentData {
  totalInvested: number;
  byMonth: Record<string, number>;
  byCategory: Record<string, number>;
}

// Extrai valores monetários do texto
function extractMoneyValues(text: string): number[] {
  const regex = /R\$\s?(\d{1,3}(?:\.\d{3})*,\d{2})/g;
  const values: number[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    try {
      const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      if (value >= 100 && value <= 100000000) {
        // Verificar se "software" está no contexto
        const start = Math.max(0, match.index - 500);
        const end = Math.min(text.length, match.index + 500);
        const context = text.substring(start, end).toLowerCase();
        
        if (context.includes('software') || context.includes('robótica')) {
          values.push(value);
        }
      }
    } catch {
      // Ignorar erros de parsing
    }
  }
  
  return values;
}

// Processa os resultados da busca para extrair investimentos
function processResults(results: any[], territoryId: string): InvestmentData {
  const byMonth: Record<string, number> = {};
  let totalInvested = 0;
  const byCategory: Record<string, number> = {};

  for (const gazette of results) {
    const date = gazette.date;
    if (!date) continue;

    const [year, month] = date.split('-');
    const monthKey = `${year}-${month}`;

    // Extrair texto dos excerpts
    let text = '';
    if (gazette.excerpts && Array.isArray(gazette.excerpts)) {
      text = gazette.excerpts.join('\n');
    } else if (gazette.excerpt) {
      text = gazette.excerpt;
    }

    const values = extractMoneyValues(text);
    const sum = values.reduce((a, b) => a + b, 0);
    
    if (sum > 0) {
      byMonth[monthKey] = (byMonth[monthKey] || 0) + sum;
      totalInvested += sum;
    }
  }

  return { totalInvested, byMonth, byCategory };
}

export default function CompareClient() {
  const first = useGazetteSearch();
  const second = useGazetteSearch();
  const [showDashboard, setShowDashboard] = useState(false);

  const handleSearch = async () => {
    // Filtros compartilhados (categoria e datas são os mesmos para ambos)
    const sharedFilters = {
      categoria: first.filters.categoria,
      dataInicio: first.filters.dataInicio,
      dataFim: first.filters.dataFim,
    };
    
    // Buscar passando os filtros compartilhados para o segundo município
    await Promise.all([
      first.search(),
      second.search(sharedFilters)
    ]);
    setShowDashboard(true);
  };

  const handleNewSearch = () => {
    first.clearResults();
    second.clearResults();
    setShowDashboard(false);
  };

  // Processar dados para comparação
  const firstData = useMemo(() => {
    return processResults(first.results, first.filters.municipio);
  }, [first.results, first.filters.municipio]);

  const secondData = useMemo(() => {
    return processResults(second.results, second.filters.municipio);
  }, [second.results, second.filters.municipio]);

  // Determinar se deve agrupar por ano (período > 1 ano) ou por mês
  const isYearlyGrouping = useMemo(() => {
    const startDate = first.filters.dataInicio;
    const endDate = first.filters.dataFim;
    
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    return diffDays > 366; // Mais de 1 ano
  }, [first.filters.dataInicio, first.filters.dataFim]);

  // Preparar dados do gráfico
  const chartData = useMemo(() => {
    const allMonths = new Set([
      ...Object.keys(firstData.byMonth),
      ...Object.keys(secondData.byMonth),
    ]);

    const sortedMonths = Array.from(allMonths).sort();
    
    // Se for agrupamento por ano, agregar os dados mensais por ano
    if (isYearlyGrouping) {
      const yearlyFirst: Record<string, number> = {};
      const yearlySecond: Record<string, number> = {};
      
      sortedMonths.forEach(monthKey => {
        const [year] = monthKey.split('-');
        yearlyFirst[year] = (yearlyFirst[year] || 0) + (firstData.byMonth[monthKey] || 0);
        yearlySecond[year] = (yearlySecond[year] || 0) + (secondData.byMonth[monthKey] || 0);
      });
      
      const years = Object.keys(yearlyFirst).concat(Object.keys(yearlySecond));
      const uniqueYears = [...new Set(years)].sort();
      
      const rawData = uniqueYears.map(year => ({
        name: year,
        fullName: year,
        first: Math.round(yearlyFirst[year] || 0),
        second: Math.round(yearlySecond[year] || 0),
        firstOriginal: Math.round(yearlyFirst[year] || 0),
        secondOriginal: Math.round(yearlySecond[year] || 0),
      }));
      
      const allValues = rawData.flatMap(d => [d.first, d.second]);
      const maxValue = Math.max(...allValues, 1);
      const minVisibleValue = maxValue * 0.05;
      
      return rawData.map(d => ({
        ...d,
        firstDisplay: d.first > 0 && d.first < minVisibleValue ? minVisibleValue : d.first,
        secondDisplay: d.second > 0 && d.second < minVisibleValue ? minVisibleValue : d.second,
      }));
    }
    
    // Agrupamento por mês (padrão)
    const rawData = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      
      return {
        name: `${MONTH_NAMES[monthIndex]}/${year.slice(2)}`,
        fullName: `${MONTH_NAMES[monthIndex]}/${year}`,
        first: Math.round(firstData.byMonth[monthKey] || 0),
        second: Math.round(secondData.byMonth[monthKey] || 0),
        firstOriginal: Math.round(firstData.byMonth[monthKey] || 0),
        secondOriginal: Math.round(secondData.byMonth[monthKey] || 0),
      };
    });
    
    // Calcular valor mínimo visível (5% do máximo) para barras muito pequenas
    const allValues = rawData.flatMap(d => [d.first, d.second]);
    const maxValue = Math.max(...allValues, 1);
    const minVisibleValue = maxValue * 0.05;
    
    // Ajustar valores muito pequenos para serem visíveis
    return rawData.map(d => ({
      ...d,
      firstDisplay: d.first > 0 && d.first < minVisibleValue ? minVisibleValue : d.first,
      secondDisplay: d.second > 0 && d.second < minVisibleValue ? minVisibleValue : d.second,
    }));
  }, [firstData.byMonth, secondData.byMonth, isYearlyGrouping]);

  // Calcular diferenças
  const difference = firstData.totalInvested - secondData.totalInvested;
  const percentageDiff = secondData.totalInvested > 0 
    ? ((difference / secondData.totalInvested) * 100).toFixed(1)
    : firstData.totalInvested > 0 ? '100' : '0';

  const firstName = TERRITORY_NAMES[first.filters.municipio] || first.filters.municipio || 'Município 1';
  const secondName = TERRITORY_NAMES[second.filters.municipio] || second.filters.municipio || 'Município 2';

  // Formatar período
  const formatPeriod = () => {
    const start = first.filters.dataInicio || second.filters.dataInicio || '';
    const end = first.filters.dataFim || second.filters.dataFim || '';
    if (start && end) {
      const formatDate = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
      };
      return `${formatDate(start)}-${formatDate(end)}`;
    }
    return 'Período não definido';
  };

  // Tooltip customizado - usa valores originais para exibição
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Usar valores originais (não os ajustados para visualização)
      const firstVal = payload[0]?.payload?.firstOriginal ?? payload[0]?.value ?? 0;
      const secondVal = payload[0]?.payload?.secondOriginal ?? payload[1]?.value ?? 0;
      const diff = firstVal - secondVal;
      const pct = secondVal > 0 ? ((diff / secondVal) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-blue-600">
            {firstName}: R$ {firstVal.toLocaleString('pt-BR')}
            {diff > 0 && <span className="text-green-500 ml-2">↗ {pct}%</span>}
          </p>
          <p className="text-green-600">
            {secondName}: R$ {secondVal.toLocaleString('pt-BR')}
            {diff < 0 && <span className="text-green-500 ml-2">↗ {Math.abs(parseFloat(pct))}%</span>}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleGeneratePDF = () => {
    window.print();
  };

  const isLoading = first.loading || second.loading;
  const hasError = first.error || second.error;

  // Tela de busca
  if (!showDashboard) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center mt-8">
          <div className="w-full mx-auto bg-transparent p-6">
            <Navbar_sec />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-5">Comparar Diários Oficiais</h1>
            <p className="text-[#01161E]">Compare investimentos em tecnologia educacional nos diários oficiais do seu município</p>
          </div>
          <div className="w-full max-w-4xl">
            <div className="bg-transparent p-6 mb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="mx-auto w-full">
                    <SearchForm
                      leftFilters={first.filters}
                      rightFilters={second.filters}
                      onLeftChange={first.updateFilters}
                      onRightChange={second.updateFilters}
                      onSearch={handleSearch}
                      loading={isLoading}
                    />
                  </div>
                </div>
                <SugestaoPesquisa />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Buscando e processando dados...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <p>{first.error || second.error}</p>
          <button
            onClick={handleNewSearch}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Dashboard de comparação
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-green-300 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Comparação de Investimentos</h1>

        {/* Cards de totais */}
        <div className="space-y-4 mb-6">
          {/* Total Município 1 */}
          <div className="bg-blue-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Total investido-{firstName}:</p>
            <p className="text-3xl font-bold">
              R$ {firstData.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Município 2 */}
          <div className="bg-green-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Total investido-{secondName}:</p>
            <p className="text-3xl font-bold">
              R$ {secondData.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Período */}
          <div className="bg-blue-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Período Analisado:</p>
            <p className="text-2xl font-bold">{formatPeriod()}</p>
          </div>

          {/* Categoria */}
          <div className="bg-purple-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Categoria:</p>
            <p className="text-2xl font-bold">{CATEGORY_LABELS[first.filters.categoria] || 'Tecnologia'}</p>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-green-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            {isYearlyGrouping ? 'Comparação de Investimentos por Ano:' : 'Comparação de Investimentos Mensais:'}
          </p>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" tick={{ fill: '#333' }} />
                <YAxis 
                  tick={{ fill: '#333' }}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="firstDisplay" name={firstName} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="secondDisplay" name={secondName} fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhum dado de investimento encontrado para comparação
            </div>
          )}
        </div>

        {/* Diferenças */}
        <div className="bg-purple-600 rounded-xl p-4 mb-6">
          <p className="text-sm text-purple-200 mb-3">Diferença Total e Percentual</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Diferença Total:</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {Math.abs(difference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {difference >= 0 
                  ? `${firstName} investiu R$ ${Math.abs(difference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a mais que ${secondName}`
                  : `${secondName} investiu R$ ${Math.abs(difference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a mais que ${firstName}`
                }
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Diferença Percentual:</p>
              <p className="text-2xl font-bold text-gray-900">{Math.abs(parseFloat(percentageDiff))}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {difference >= 0 
                  ? `${firstName} investiu ${Math.abs(parseFloat(percentageDiff))}% a mais que ${secondName}`
                  : `${secondName} investiu ${Math.abs(parseFloat(percentageDiff))}% a mais que ${firstName}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleNewSearch}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
          >
            Nova busca
          </button>
          <button
            onClick={handleGeneratePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
          >
            Gerar relatório PDF
          </button>
        </div>
      </div>
    </div>
  );
}
