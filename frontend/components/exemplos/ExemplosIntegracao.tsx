/**
 * Exemplo de Componente: Como Usar os Serviços de Integração
 * Este arquivo demonstra como utilizar os hooks e serviços em seus componentes
 */

'use client';

import { useState } from 'react';
import BackendIntegrationService from '@/services/backend-integration';
import useBackendAnalysis from '@/hooks/useBackendAnalysis';
import useComparisonService from '@/hooks/useComparisonService';

/**
 * EXEMPLO 1: Usar BackendIntegrationService Diretamente
 */
export function ExemploServicoDireto() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    setLoading(true);
    try {
      // Busca simples
      const response = await BackendIntegrationService.search(
        '5300108', // Brasília
        'software',
        '2024-01-01',
        '2024-12-31'
      );
      setResults(response);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={buscar} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar Diários'}
      </button>
      {results && <p>Encontrados: {results.total_gazettes}</p>}
    </div>
  );
}

/**
 * EXEMPLO 2: Usar Hook useBackendAnalysis
 */
export function ExemploHookAnalise() {
  const { data, loading, error, progress, analyze } = useBackendAnalysis();

  const iniciarAnalise = async () => {
    await analyze(
      '5300108',          // Brasília
      '2024-01-01',       // Data início
      '2024-12-31',       // Data fim
      'software'          // Palavra-chave
    );
  };

  return (
    <div>
      <button onClick={iniciarAnalise} disabled={loading}>
        🤖 Analisar com IA
      </button>

      {loading && (
        <div>
          <p>Processando... {progress}%</p>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#eee',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {data && (
        <div>
          <h3>Resultado da Análise</h3>
          <p>Total investido: R$ {data.data.total_invested.toLocaleString('pt-BR')}</p>
          <p>Total de entidades: {data.data.total_entities}</p>
          
          <h4>Investimentos por Categoria:</h4>
          <ul>
            {Object.entries(data.data.investments_by_category).map(([cat, value]) => (
              <li key={cat}>
                {cat}: R$ {(value as number).toLocaleString('pt-BR')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * EXEMPLO 3: Usar Hook useComparisonService
 */
export function ExemploHookComparacao() {
  const { data, loading, error, compare } = useComparisonService();

  const iniciarComparacao = async () => {
    await compare(
      '5300108',          // Brasília
      '2024-01-01',       // Data início A
      '2024-06-30',       // Data fim A
      '5208707',          // Goiânia
      '2024-01-01',       // Data início B
      '2024-06-30',       // Data fim B
      'software'          // Palavra-chave
    );
  };

  return (
    <div>
      <button onClick={iniciarComparacao} disabled={loading}>
        ⚖️ Comparar Territórios
      </button>

      {loading && <p>Comparando...</p>}

      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {data && (
        <div>
          <h3>Resultado da Comparação</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Territory A */}
            <div style={{ border: '1px solid blue', padding: '10px' }}>
              <h4>{data.meta.territory_a_name}</h4>
              <p>Investido: R$ {data.data.territory_a_analysis.total_invested.toLocaleString('pt-BR')}</p>
              <p>Entidades: {data.data.territory_a_analysis.total_entities}</p>
            </div>

            {/* Territory B */}
            <div style={{ border: '1px solid green', padding: '10px' }}>
              <h4>{data.meta.territory_b_name}</h4>
              <p>Investido: R$ {data.data.territory_b_analysis.total_invested.toLocaleString('pt-BR')}</p>
              <p>Entidades: {data.data.territory_b_analysis.total_entities}</p>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
            <h4>Vencedor: {data.data.differences.winner}</h4>
            <p>Diferença: R$ {Math.abs(data.data.differences.investment_diff).toLocaleString('pt-BR')}</p>
            <p>Percentual: {data.data.differences.investment_percentage.toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EXEMPLO 4: Componente Completo com Tabs
 */
export function ComponenteCompletoComTabs() {
  const [tab, setTab] = useState<'search' | 'analyze' | 'compare'>('search');
  const [territory, setTerritory] = useState('5300108');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [keyword, setKeyword] = useState('software');

  const { data: analysisData, loading: analysisLoading, analyze } = useBackendAnalysis();
  const { data: comparisonData, loading: comparisonLoading, compare } = useComparisonService();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setTab('search')}
          style={{
            padding: '10px 20px',
            backgroundColor: tab === 'search' ? '#007bff' : '#ddd',
            color: tab === 'search' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Busca
        </button>
        <button
          onClick={() => setTab('analyze')}
          style={{
            padding: '10px 20px',
            backgroundColor: tab === 'analyze' ? '#007bff' : '#ddd',
            color: tab === 'analyze' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Análise
        </button>
        <button
          onClick={() => setTab('compare')}
          style={{
            padding: '10px 20px',
            backgroundColor: tab === 'compare' ? '#007bff' : '#ddd',
            color: tab === 'compare' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Comparação
        </button>
      </div>

      {/* Filtros Comuns */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Território IBGE"
          value={territory}
          onChange={(e) => setTerritory(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Palavra-chave"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '8px' }}
        />
      </div>

      {/* Conteúdo das Abas */}
      {tab === 'search' && <ExemploServicoDireto />}
      
      {tab === 'analyze' && (
        <div>
          <button
            onClick={() => analyze(territory, startDate, endDate, keyword)}
            disabled={analysisLoading}
          >
            {analysisLoading ? 'Analisando...' : 'Iniciar Análise'}
          </button>
          {analysisData && (
            <div>
              <h3>Análise Concluída</h3>
              <p>Total investido: R$ {analysisData.data.total_invested.toLocaleString('pt-BR')}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'compare' && (
        <div>
          <button
            onClick={() => compare(territory, startDate, endDate, '5208707', startDate, endDate, keyword)}
            disabled={comparisonLoading}
          >
            {comparisonLoading ? 'Comparando...' : 'Comparar com Goiânia'}
          </button>
          {comparisonData && (
            <div>
              <h3>Comparação Concluída</h3>
              <p>Vencedor: {comparisonData.data.differences.winner}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComponenteCompletoComTabs;
