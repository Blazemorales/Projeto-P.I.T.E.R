/**
 * Serviço para carregar dados históricos do backend/data_output
 * Permite visualizar análises e comparações salvas anteriormente
 */

export interface AnalysisFile {
  filename: string;
  territory_id: string;
  date: string;
  type: 'search' | 'compare';
  filepath: string;
}

export interface DataStats {
  totalAnalyses: number;
  totalComparisons: number;
  latestAnalysis: AnalysisFile | null;
  latestComparison: AnalysisFile | null;
  territories: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Serviço para carregar dados históricos
 */
export class DataHistoryService {
/**
 * Listar todos os arquivos de dados disponíveis
 */
static async listAnalysisFiles(): Promise<AnalysisFile[]> {
  try {
    // Tentar carregar do backend
    try {
      const response = await fetch(`${API_BASE_URL}/data_output`);
      if (response.ok) {
        const data = await response.json();
        const files: AnalysisFile[] = data.files.map((file: any) => ({
          filename: file.name,
          territory_id: file.territory_id || 'unknown',
          date: new Date(file.modified * 1000).toISOString(),
          type: file.type as 'search' | 'compare',
          filepath: `${API_BASE_URL}/data_output/${file.name}`,
        }));
        console.log('✅ Arquivos do backend carregados:', files.length);
        return files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (backendError) {
      console.warn('⚠️ Erro ao carregar do backend, usando localStorage:', backendError);
    }

    // Fallback: dados do localStorage
    const files: AnalysisFile[] = [];

    if (typeof window !== 'undefined') {
      const localSearch = localStorage.getItem('latest_search');
      if (localSearch) {
        try {
          const data = JSON.parse(localSearch);
          files.push({
            filename: 'latest_search.json',
            territory_id: data.meta?.source_territory || 'unknown',
            date: data.meta?.generated_at || new Date().toISOString(),
            type: 'search',
            filepath: '/data/latest_search.json',
          });
        } catch (e) {
          console.warn('Erro ao parse localStorage search:', e);
        }
      }

      const localComparison = localStorage.getItem('latest_comparison');
      if (localComparison) {
        try {
          const data = JSON.parse(localComparison);
          files.push({
            filename: 'latest_comparison.json',
            territory_id: `${data.meta?.territory_a}-vs-${data.meta?.territory_b}`,
            date: data.meta?.generated_at || new Date().toISOString(),
            type: 'compare',
            filepath: '/data/latest_comparison.json',
          });
        } catch (e) {
          console.warn('Erro ao parse localStorage comparison:', e);
        }
      }
    }

    return files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return [];
  }
}  /**
   * Carregar análise específica
   */
  static async loadAnalysis(filepath: string): Promise<any> {
    try {
      // Se for do backend, carregar via API
      if (filepath.includes(API_BASE_URL)) {
        const response = await fetch(filepath);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.statusText}`);
        }
        return await response.json();
      }

      // Senão, carregar localmente
      const response = await fetch(filepath);
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas dos dados disponíveis
   */
  static async getDataStats(): Promise<DataStats> {
    try {
      const files = await this.listAnalysisFiles();

      const searches = files.filter((f) => f.type === 'search');
      const comparisons = files.filter((f) => f.type === 'compare');
      const territories = Array.from(new Set(files.map((f) => f.territory_id)));

      return {
        totalAnalyses: searches.length,
        totalComparisons: comparisons.length,
        latestAnalysis: searches[0] || null,
        latestComparison: comparisons[0] || null,
        territories,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalAnalyses: 0,
        totalComparisons: 0,
        latestAnalysis: null,
        latestComparison: null,
        territories: [],
      };
    }
  }

  /**
   * Buscar análises por território
   */
  static async searchByTerritory(territoryId: string): Promise<AnalysisFile[]> {
    const files = await this.listAnalysisFiles();
    return files.filter((f) => f.territory_id.includes(territoryId));
  }

  /**
   * Limpar dados históricos
   */
  static clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('latest_search');
      localStorage.removeItem('latest_comparison');
      console.log('✅ Histórico de dados limpo');
    }
  }
}

export default DataHistoryService;
