/**
 * Hook: useBackendAnalysis
 * Gerencia o fluxo de análise completa com IA
 * 
 * Uso:
 * const { data, loading, error, analyze } = useBackendAnalysis();
 * await analyze('5300108', '2024-01-01', '2024-12-31', 'software');
 */

'use client';

import { useState, useCallback } from 'react';
import BackendIntegrationService from '@/services/backend-integration';
import { AnalysisResponse } from '@/types';

export interface AnalysisState {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
  progress: number; // 0-100
}

export const useBackendAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    data: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const analyze = useCallback(
    async (
      territoryId: string,
      since: string,
      until: string,
      keywords?: string
    ) => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        progress: 10,
      }));

      try {
        setState(prev => ({ ...prev, progress: 30 }));
        console.log('🔄 Iniciando análise...', { territoryId, since, until, keywords });

        const response = await BackendIntegrationService.analyze(
          territoryId,
          since,
          until,
          keywords
        );

        setState(prev => ({ ...prev, progress: 90 }));

        console.log('✅ Análise concluída:', response);

        setState(prev => ({
          ...prev,
          data: response,
          loading: false,
          progress: 100,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro na análise:', errorMessage);

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          progress: 0,
        }));

        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    analyze,
    reset,
  };
};

export default useBackendAnalysis;
