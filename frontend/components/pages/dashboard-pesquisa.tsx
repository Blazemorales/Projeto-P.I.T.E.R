'use client';

/**
 * Dashboard de Pesquisa - Componente principal para pesquisa de dados
 * Integra dados do backend com interface responsiva e tratamento de erros
 * 
 * Fluxos integrados:
 * 1. ✅ Busca Simples de Diários (via Querido Diário)
 * 2. ✅ Análise Completa com IA (NER + Estatísticas + Gemini)
 * 3. ✅ Comparação entre Territórios
 */

import React, { useState, useEffect, useCallback } from 'react';
import BackendIntegrationService from '@/services/backend-integration';
import useBackendAnalysis from '@/hooks/useBackendAnalysis';
import useComparisonService from '@/hooks/useComparisonService';
import useDataHistory from '@/hooks/useDataHistory';
import { SearchResponse, Gazette, AnalysisResponse, ComparisonResponse } from '@/types';
import { AlertCircle, Loader2, CheckCircle, TrendingUp, History, Download, Trash2 } from 'lucide-react';


interface SearchState {
  loading: boolean;
  error: string | null;
  results: Gazette[];
  total: number;
}

interface AnalysisState {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

interface ComparisonState {
  data: ComparisonResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Componente principal do Dashboard de Pesquisa
 */
export default function DashboardPesquisa() {
  // Filtros de Busca
  const [territorio, setTerritorio] = useState<string>('5300108'); // Brasília (padrão)
  const [dataInicio, setDataInicio] = useState<string>('2024-01-01');
  const [dataFim, setDataFim] = useState<string>('2024-12-31');
  const [palavraChave, setPalavraChave] = useState<string>('software');

  // Estados locais
  const [searchState, setSearchState] = useState<SearchState>({
    loading: false,
    error: null,
    results: [],
    total: 0,
  });

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    data: null,
    loading: false,
    error: null,
  });

  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    data: null,
    loading: false,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<'search' | 'analyze' | 'compare' | 'history'>('search');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [selectedHistoryData, setSelectedHistoryData] = useState<any>(null);
  
  // Hook customizado para análise
  const { data: analysisData, loading: analysisLoading, error: analysisError, analyze } = useBackendAnalysis();
  
  // Hook customizado para comparação
  const { data: comparisonData, loading: comparisonLoading, error: comparisonError, compare } = useComparisonService();
  
  // Hook customizado para histórico
  const { files: historyFiles, stats: dataStats, loading: historyLoading, loadData: loadHistoryData, clearHistory } = useDataHistory();

  /**
   * Verifica saúde do backend na inicialização
   */
  useEffect(() => {
    checkBackendHealth();
  }, []);

  /**
   * Verifica se o backend está online
   */
  const checkBackendHealth = async () => {
    const online = await BackendIntegrationService.healthCheck();
    setBackendOnline(online);
    if (!online) {
      console.warn('⚠️ Backend offline - algumas funcionalidades podem estar limitadas');
    }
  };

  /**
   * FLUXO 1: Busca Simples de Diários
   */
  const handleSearch = useCallback(async () => {
    if (!territorio || !palavraChave) {
      setSearchState(prev => ({
        ...prev,
        error: 'Por favor, preencha território e palavra-chave',
      }));
      return;
    }

    setSearchState({ loading: true, error: null, results: [], total: 0 });

    try {
      console.log('🔍 Iniciando busca simples...', { territorio, palavraChave, dataInicio, dataFim });
      
      const response = await BackendIntegrationService.search(
        territorio,
        palavraChave,
        dataInicio,
        dataFim
      );

      setSearchState({
        loading: false,
        error: null,
        results: response.gazettes,
        total: response.total_gazettes,
      });

      console.log('✅ Busca concluída:', response.gazettes.length, 'resultados');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar';
      setSearchState({ loading: false, error: errorMessage, results: [], total: 0 });
    }
  }, [territorio, palavraChave, dataInicio, dataFim]);

  /**
   * FLUXO 2: Análise Completa com IA
   */
  const handleAnalyze = useCallback(async () => {
    if (!territorio) {
      setAnalysisState(prev => ({
        ...prev,
        error: 'Por favor, selecione um território',
      }));
      return;
    }

    try {
      setAnalysisState({ data: null, loading: true, error: null });
      console.log('🤖 Iniciando análise com IA...', { territorio, dataInicio, dataFim, palavraChave });
      
      const result = await analyze(territorio, dataInicio, dataFim, palavraChave || undefined);
      
      setAnalysisState({ data: result, loading: false, error: null });
      console.log('✅ Análise concluída:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao analisar';
      setAnalysisState({ data: null, loading: false, error: errorMessage });
    }
  }, [territorio, dataInicio, dataFim, palavraChave, analyze]);

  /**
   * FLUXO 3: Comparação entre Territórios
   */
  const handleCompare = useCallback(async () => {
    // Simular segunda região para comparação
    const territoryB = territorio === '5300108' ? '5208707' : '5300108';
    
    if (!territorio || !territoryB) {
      setComparisonState(prev => ({
        ...prev,
        error: 'Erro ao preparar comparação',
      }));
      return;
    }

    try {
      setComparisonState({ data: null, loading: true, error: null });
      console.log('⚖️ Iniciando comparação...', { territorio, territoryB, dataInicio, dataFim });
      
      const result = await compare(
        territorio,
        dataInicio,
        dataFim,
        territoryB,
        dataInicio,
        dataFim,
        palavraChave || undefined
      );
      
      setComparisonState({ data: result, loading: false, error: null });
      console.log('✅ Comparação concluída:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao comparar';
      setComparisonState({ data: null, loading: false, error: errorMessage });
    }
  }, [territorio, dataInicio, dataFim, palavraChave, compare]);

  /**
   * Formata moeda em Real
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔬 P.I.T.E.R Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Plataforma de Integração e Transparência em Educação e Recursos
          </p>
          
          {/* Status do Backend */}
          <div className="flex items-center gap-2">
            {backendOnline ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">Backend conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">Backend offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Abas de Funcionalidade */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Busca Simples
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analyze'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤖 Análise com IA
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'compare'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚖️ Comparação
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Histórico de Dados
            </button>
          </div>

          {/* Filtros Comuns */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Território (IBGE)
                </label>
                <input
                  type="text"
                  value={territorio}
                  onChange={(e) => setTerritorio(e.target.value)}
                  placeholder="5300108"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  5300108 = Brasília | 5208707 = Goiânia
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palavra-Chave
                </label>
                <input
                  type="text"
                  value={palavraChave}
                  onChange={(e) => setPalavraChave(e.target.value)}
                  placeholder="software, robótica..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {/* TAB 1: BUSCA SIMPLES */}
            {activeTab === 'search' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔍 Busca Simples de Diários
                </h3>
                <p className="text-gray-600 mb-4">
                  Busca rápida de diários na Querido Diário API
                </p>

                <button
                  onClick={handleSearch}
                  disabled={searchState.loading || !backendOnline}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 mb-4"
                >
                  {searchState.loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Buscando...
                    </span>
                  ) : (
                    '🔍 Buscar Diários'
                  )}
                </button>

                {searchState.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                    <AlertCircle size={18} className="inline mr-2" />
                    {searchState.error}
                  </div>
                )}

                {searchState.results.length > 0 && (
                  <div>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={18} className="inline text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        {searchState.total} diários encontrados
                      </span>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {searchState.results.map((gazette, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {gazette.territory_name || `Território ${gazette.territory_id}`}
                            </h4>
                            <span className="text-sm text-gray-500">{gazette.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Edição: {gazette.edition} {gazette.is_extra_edition && '(Extra)'}
                          </p>
                          {gazette.url && (
                            <a
                              href={gazette.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Abrir diário →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ANÁLISE COM IA */}
            {activeTab === 'analyze' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🤖 Análise Completa com IA
                </h3>
                <p className="text-gray-600 mb-4">
                  Pipeline NLP + IA (Gemini) + Estatísticas + Categorização
                </p>

                <button
                  onClick={handleAnalyze}
                  disabled={analysisLoading || !backendOnline}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-gray-400 mb-4"
                >
                  {analysisLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Analisando... (pode levar alguns minutos)
                    </span>
                  ) : (
                    '🤖 Iniciar Análise'
                  )}
                </button>

                {analysisError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                    <AlertCircle size={18} className="inline mr-2" />
                    {analysisError}
                  </div>
                )}

                {analysisData && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={18} className="inline text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Análise concluída com sucesso!
                      </span>
                    </div>

                    {/* Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Total de Entidades</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analysisData.data.total_entities}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Total Investido</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(analysisData.data.total_invested)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Período</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {analysisData.meta.period}
                        </p>
                      </div>
                    </div>

                    {/* Investimentos por Categoria */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Investimentos por Categoria</h4>
                      <div className="space-y-2">
                        {Object.entries(analysisData.data.investments_by_category).map(([cat, value]) => (
                          <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{cat}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Análise Qualitativa */}
                    {analysisData.data.qualitative_analysis && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Análise Qualitativa</h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(analysisData.data.qualitative_analysis, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMPARAÇÃO */}
            {activeTab === 'compare' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ⚖️ Comparação entre Territórios
                </h3>
                <p className="text-gray-600 mb-4">
                  Compare investimentos e métricas entre dois territórios
                </p>

                <button
                  onClick={handleCompare}
                  disabled={comparisonLoading || !backendOnline}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:bg-gray-400 mb-4"
                >
                  {comparisonLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Comparando...
                    </span>
                  ) : (
                    '⚖️ Comparar Territórios'
                  )}
                </button>

                {comparisonError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                    <AlertCircle size={18} className="inline mr-2" />
                    {comparisonError}
                  </div>
                )}

                {comparisonData && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={18} className="inline text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Comparação concluída!
                      </span>
                    </div>

                    {/* Resultado da Comparação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          {comparisonData.meta.territory_a_name}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            <strong>Período:</strong> {comparisonData.meta.period_a}
                          </p>
                          <p>
                            <strong>Total Investido:</strong>{' '}
                            {formatCurrency(comparisonData.data.territory_a_analysis.total_invested)}
                          </p>
                          <p>
                            <strong>Entidades:</strong>{' '}
                            {comparisonData.data.territory_a_analysis.total_entities}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <h4 className="font-semibold text-green-900 mb-2">
                          {comparisonData.meta.territory_b_name}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            <strong>Período:</strong> {comparisonData.meta.period_b}
                          </p>
                          <p>
                            <strong>Total Investido:</strong>{' '}
                            {formatCurrency(comparisonData.data.territory_b_analysis.total_invested)}
                          </p>
                          <p>
                            <strong>Entidades:</strong>{' '}
                            {comparisonData.data.territory_b_analysis.total_entities}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vencedor */}
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <TrendingUp className="inline text-yellow-600 mr-2" size={20} />
                      <span className="font-bold text-yellow-900">
                        Vencedor: {comparisonData.data.differences.winner}
                      </span>
                      <p className="text-sm text-yellow-800 mt-2">
                        Diferença: {formatCurrency(Math.abs(comparisonData.data.differences.investment_diff))}
                        ({comparisonData.data.differences.investment_percentage.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HISTÓRICO DE DADOS */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Histórico de Dados Salvos
                </h3>
                <p className="text-gray-600 mb-4">
                  Visualize análises e comparações salvas anteriormente
                </p>

                {/* Resumo de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600">Total de Análises</p>
                    <p className="text-2xl font-bold text-blue-600">{dataStats.totalAnalyses}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-gray-600">Comparações</p>
                    <p className="text-2xl font-bold text-purple-600">{dataStats.totalComparisons}</p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-600">Territórios Únicos</p>
                    <p className="text-2xl font-bold text-green-600">{dataStats.territories.length}</p>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-gray-600">Arquivos</p>
                    <p className="text-2xl font-bold text-orange-600">{historyFiles.length}</p>
                  </div>
                </div>

                {/* Últimos Arquivos */}
                {historyLoading ? (
                  <div className="text-center py-8">
                    <Loader2 size={24} className="animate-spin inline text-blue-600" />
                    <p className="text-gray-600 mt-2">Carregando histórico...</p>
                  </div>
                ) : historyFiles.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">Últimos Arquivos</h4>
                      <button
                        onClick={clearHistory}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Limpar
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {historyFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold text-gray-900">
                                {file.type === 'search' ? '📈 Análise' : '⚖️ Comparação'}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Arquivo: {file.filename}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(file.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            <strong>Território:</strong> {file.territory_id}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const data = await loadHistoryData(file.filepath);
                                  setSelectedHistoryData(data);
                                } catch (error) {
                                  console.error('Erro ao carregar:', error);
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                            >
                              <Download size={14} className="inline mr-1" />
                              Ver Dados
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <History size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhum arquivo de histórico encontrado</p>
                    <p className="text-sm text-gray-400 mt-2">Realize análises para começar a gerar histórico</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Visualização de Dados (History) */}
        {selectedHistoryData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-8">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Dados Históricos
                </h3>
                <button
                  onClick={() => setSelectedHistoryData(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Metadados */}
                {selectedHistoryData.meta && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Informações</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Território:</strong> {selectedHistoryData.meta.source_territory || selectedHistoryData.meta.territory_a}</p>
                      <p><strong>Período:</strong> {selectedHistoryData.meta.period}</p>
                      <p><strong>Keywords:</strong> {selectedHistoryData.meta.search_keywords || 'N/A'}</p>
                      <p><strong>Data:</strong> {new Date(selectedHistoryData.meta.generated_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )}

                {/* Dados Principais */}
                {selectedHistoryData.data && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Resumo</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Total Investido:</strong> {formatCurrency(selectedHistoryData.data.total_invested)}</p>
                        <p><strong>Entidades:</strong> {selectedHistoryData.data.total_entities}</p>
                      </div>
                    </div>

                    {selectedHistoryData.data.investments_by_category && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Investimentos por Categoria</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(selectedHistoryData.data.investments_by_category).map(([cat, value]) => (
                            <p key={cat}>
                              {cat}: <strong>{formatCurrency(value as number)}</strong>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedHistoryData.data.qualitative_analysis && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Análise Qualitativa</h4>
                        <pre className="text-xs whitespace-pre-wrap text-gray-700">
                          {JSON.stringify(selectedHistoryData.data.qualitative_analysis, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedHistoryData(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer com informações técnicas */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>🚀 P.I.T.E.R v1.3.0 | Backend: FastAPI | Frontend: Next.js</p>
          <p>Documentação completa em: <code className="bg-gray-200 px-2 py-1 rounded">GUIA_IMPLEMENTACAO_INTEGRACAO_B.md</code></p>
        </div>
      </div>
    </div>
  );
}
