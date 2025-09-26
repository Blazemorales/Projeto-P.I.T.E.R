'use client';

import React from 'react';
import { InvestmentData, STATES, CITIES } from '@/types';

interface ResultCardProps {
  item: InvestmentData;
  municipio: string;
  estado: string;
}

export default function ResultCard({ item, municipio, estado }: ResultCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 hover:shadow-lg transition">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-primary">
          {municipio}, {estado}
        </h3>
        <span className="text-sm text-gray-500">{item.month}</span>
      </div>

      {/* Conteúdo */}
      <p className="text-gray-700 mb-4">
        Investimentos registrados:{' '}
        <span className="font-semibold text-secondary">{item.count}</span>
      </p>

      {/* Ações (se houver no Figma) */}
      <div className="flex gap-3">
        <button className="btn btn-primary text-sm px-4 py-2">
          Ver detalhes
        </button>
        <button className="btn btn-secondary text-sm px-4 py-2">
          Salvar
        </button>
      </div>
    </div>
  );
}
