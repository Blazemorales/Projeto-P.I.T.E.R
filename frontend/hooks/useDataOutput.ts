/**
 * Hook: useDataOutput
 * Carrega e gerencia dados do data_output do backend
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import BackendIntegrationService from '@/services/backend-integration';

export interface DataOutputFile {
  name: string;
  size: number;
  modified: number;
  type: 'analysis' | 'comparison' | 'search';
  territory_id?: string;
  data?: any;
  error?: string;
}

export interface DataOutputState {
  files: DataOutputFile[];
  loading: boolean;
  error: string | null;
  selectedFile: DataOutputFile | null;
  fileContent: any;
}

export const useDataOutput = () => {
  const [state, setState] = useState<DataOutputState>({
    files: [],
    loading: false,
    error: null,
    selectedFile: null,
    fileContent: null,
  });

  /**
   * Carregar lista de arquivos
   */
  const loadFiles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('📂 Carregando lista de arquivos...');
      const response = await BackendIntegrationService.loadDataOutput();

      setState(prev => ({
        ...prev,
        files: response.files,
        loading: false,
        error: null,
      }));

      console.log('✅ Arquivos carregados:', response.files.length);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao carregar arquivos';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        files: [],
      }));
    }
  }, []);

  /**
   * Selecionar e carregar arquivo específico
   */
  const selectFile = useCallback(async (file: DataOutputFile) => {
    setState(prev => ({ ...prev, selectedFile: file, loading: true, error: null }));

    try {
      console.log('📄 Carregando arquivo:', file.name);
      const content = await BackendIntegrationService.loadDataOutputFile(file.name);

      setState(prev => ({
        ...prev,
        fileContent: content,
        loading: false,
        error: null,
      }));

      console.log('✅ Arquivo carregado:', file.name);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao carregar arquivo';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        fileContent: null,
      }));
    }
  }, []);

  /**
   * Limpar seleção
   */
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFile: null,
      fileContent: null,
      error: null,
    }));
  }, []);

  /**
   * Formatar data
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('pt-BR');
  };

  /**
   * Formatar tamanho do arquivo
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return {
    ...state,
    loadFiles,
    selectFile,
    clearSelection,
    formatDate,
    formatFileSize,
  };
};

export default useDataOutput;
