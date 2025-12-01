/**
 * Hook: useDataHistory
 * Gerencia o histórico de dados salvos em localStorage e public/data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import DataHistoryService, { DataStats, AnalysisFile } from '@/services/data-history';

export interface DataHistoryState {
  files: AnalysisFile[];
  stats: DataStats;
  loading: boolean;
  error: string | null;
}

export const useDataHistory = () => {
  const [state, setState] = useState<DataHistoryState>({
    files: [],
    stats: {
      totalAnalyses: 0,
      totalComparisons: 0,
      latestAnalysis: null,
      latestComparison: null,
      territories: [],
    },
    loading: false,
    error: null,
  });

  /**
   * Carregar histórico de dados
   */
  const loadHistory = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [files, stats] = await Promise.all([
        DataHistoryService.listAnalysisFiles(),
        DataHistoryService.getDataStats(),
      ]);

      setState({
        files,
        stats,
        loading: false,
        error: null,
      });

      console.log('✅ Histórico carregado:', files.length, 'arquivos');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error('❌ Erro ao carregar histórico:', error);
    }
  }, []);

  /**
   * Carregar dados específicos
   */
  const loadData = useCallback(async (filepath: string) => {
    try {
      console.log('📂 Carregando:', filepath);
      const data = await DataHistoryService.loadAnalysis(filepath);
      console.log('✅ Dados carregados:', data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar';
      console.error('❌ Erro:', errorMessage);
      throw error;
    }
  }, []);

  /**
   * Buscar por território
   */
  const searchByTerritory = useCallback(async (territoryId: string) => {
    try {
      const files = await DataHistoryService.searchByTerritory(territoryId);
      setState((prev) => ({ ...prev, files }));
      return files;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return [];
    }
  }, []);

  /**
   * Limpar histórico
   */
  const clearHistory = useCallback(() => {
    DataHistoryService.clearHistory();
    setState({
      files: [],
      stats: {
        totalAnalyses: 0,
        totalComparisons: 0,
        latestAnalysis: null,
        latestComparison: null,
        territories: [],
      },
      loading: false,
      error: null,
    });
  }, []);

  /**
   * Carregar ao montar
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    ...state,
    loadHistory,
    loadData,
    searchByTerritory,
    clearHistory,
  };
};

export default useDataHistory;
