'use client';

import { useState, useCallback } from 'react';
import { SearchFilters, SearchResponse, SearchState, MUNICIPALITIES } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useGazetteSearch = () => {
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    total: 0,
    filters: {
      municipio: '',
      categoria: '',
      dataInicio: '',
      dataFim: '',
      territory_id: '',
      published_since: '',
      published_until: '',
      querystring: '',
    },
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const municipality = newFilters.municipio 
      ? MUNICIPALITIES.find(m => m.value === newFilters.municipio)
      : null;

    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        // Allow explicitly setting territory_id (used for state select). If not
        // provided, fall back to resolved municipality value or previous value.
        territory_id: (newFilters as any).territory_id || municipality?.value || prev.filters.territory_id,
        published_since: newFilters.dataInicio || prev.filters.published_since,
        published_until: newFilters.dataFim || prev.filters.published_until,
        querystring: newFilters.categoria || prev.filters.querystring,
      },
      error: null,
    }));
  }, []);

  const search = useCallback(async (overrideFilters?: Partial<SearchFilters>) => {
    // Permite sobrescrever filtros (útil para comparação)
    const filters = overrideFilters 
      ? { ...state.filters, ...overrideFilters }
      : state.filters;
    
    const { municipio, categoria, dataInicio, dataFim } = filters;

    console.log('🔍 Iniciando busca com filtros:', { municipio, categoria, dataInicio, dataFim });

    // Validações
    if (!municipio) {
      console.log('❌ Erro: Município não selecionado');
      setState(prev => ({ ...prev, error: 'Selecione um município' }));
      return;
    }

    if (!categoria) {
      console.log('❌ Erro: Categoria não selecionada');
      setState(prev => ({ ...prev, error: 'Selecione uma categoria' }));
      return;
    }

    // Encontrar o código IBGE do município
    const municipality = MUNICIPALITIES.find(m => m.value === municipio);
    if (!municipality) {
      setState(prev => ({ ...prev, error: 'Município inválido' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Construir parâmetros da query
      const params = new URLSearchParams({
        territory_ids: municipality.value,
        size: '100', // Buscar até 100 resultados
      });

      // Adicionar filtro de categoria como palavra-chave
      // Usando apenas termos simples e específicos (sem palavras compostas)
      if (categoria === 'robotica') {
        params.append('querystring', 'robótica');
      } else if (categoria === 'software') {
        params.append('querystring', 'software');
      }

      // Adicionar filtros de data se fornecidos
      if (dataInicio) {
        params.append('published_since', dataInicio);
      }
      if (dataFim) {
        params.append('published_until', dataFim);
      }

      const apiUrl = `${API_BASE_URL}/api/v1/gazettes?${params}`;
      console.log('🌐 Fazendo requisição para:', apiUrl);
      console.log('🔧 API_BASE_URL:', API_BASE_URL);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      setState(prev => ({
        ...prev,
        loading: false,
        results: data.gazettes || [],
        total: data.total_gazettes || 0,
        error: null,
      }));

      // NOVO: Salvar resultados no backend para sincronizar com dashboard
      // Executado em background (não bloqueia a busca)
      // Se falhar, apenas loga warning mas não afeta a busca
      import('@/services/backend-integration').then(module => {
        module.default.saveSearchResults(
          data.gazettes || [],
          {
            territory_id: municipality.value,
            municipio: municipio,
            dataInicio: dataInicio,
            dataFim: dataFim,
            categoria: categoria,
            querystring: categoria,
          }
        ).catch((error) => {
          // Erro silencioso - não afeta a busca
          console.warn('Aviso: Resultados não foram salvos para o dashboard:', error);
        });
      }).catch(() => {
        // Erro ao importar - ignorar silenciosamente
      });

    } catch (error) {
      console.error('Erro na busca:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar diários oficiais',
      }));
    }
  }, [state.filters]);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      total: 0,
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updateFilters,
    search,
    clearResults,
    clearError,
  };
};