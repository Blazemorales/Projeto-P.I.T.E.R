/**
 * Hook: useComparisonService
 * Gerencia o fluxo de comparação entre territórios
 * 
 * Uso:
 * const { data, loading, error, compare } = useComparisonService();
 * await compare('5300108', '2024-01-01', '2024-06-30', '5208707', '2024-01-01', '2024-06-30', 'software');
 */

'use client';

import { useState, useCallback } from 'react';
import BackendIntegrationService from '@/services/backend-integration';
import { ComparisonResponse } from '@/types';

export interface ComparisonState {
  data: ComparisonResponse | null;
  loading: boolean;
  error: string | null;
  progress: number; // 0-100
}

export const useComparisonService = () => {
  const [state, setState] = useState<ComparisonState>({
    data: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const compare = useCallback(
    async (
      territoryA: string,
      dateAStart: string,
      dateAEnd: string,
      territoryB: string,
      dateBStart: string,
      dateBEnd: string,
      keywords?: string
    ) => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        progress: 10,
      }));

      try {
        setState(prev => ({ ...prev, progress: 25 }));
        console.log('🔄 Iniciando comparação...', {
          territoryA,
          dateAStart,
          dateAEnd,
          territoryB,
          dateBStart,
          dateBEnd,
          keywords,
        });

        setState(prev => ({ ...prev, progress: 50 }));

        const response = await BackendIntegrationService.compare(
          territoryA,
          dateAStart,
          dateAEnd,
          territoryB,
          dateBStart,
          dateBEnd,
          keywords
        );

        setState(prev => ({ ...prev, progress: 90 }));

        console.log('✅ Comparação concluída:', response);

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
        console.error('❌ Erro na comparação:', errorMessage);

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
    compare,
    reset,
  };
};

export default useComparisonService;
