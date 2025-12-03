/**
 * Página de Dashboard de Investimentos
 * Exibe visualizações dos dados de investimento em tecnologia educacional
 */

'use client';

import React from 'react';
import DashboardCharts from '@/components/organisms/DashboardCharts';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <DashboardCharts />
    </main>
  );
}
