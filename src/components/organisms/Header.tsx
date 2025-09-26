// CAMADA 1: APRESENTAÇÃO - ORGANISM
// Seções complexas - Header do P.I.T.E.R

'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo / Título */}
        <h1 className="text-xl md:text-2xl font-bold text-primary">
          P.I.T.E.R
        </h1>

        {/* Navegação */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-primary transition-colors">
            Início
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Sobre nós
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
};
