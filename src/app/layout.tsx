import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'P.I.T.E.R - Painel de Investimentos em Transparência e Eficiência de Recursos',
  description:
    'Monitoramento de investimentos em tecnologias educacionais nos diários oficiais municipais',
  keywords:
    'investimentos públicos, transparência, Goiás, Goiânia, Porto Alegre, pesquisa, eletrônicos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Cabeçalho */}
        <header className="w-full bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              P.I.T.E.R
            </h1>
            <nav className="hidden md:flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary">
                Início
              </a>
              <a href="#" className="hover:text-primary">
                Sobre
              </a>
              <a href="#" className="hover:text-primary">
                Contato
              </a>
            </nav>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>

        {/* Rodapé */}
        <footer className="mt-16 border-t bg-white">
          <div className="max-w-7xl mx-auto py-6 px-6 text-center text-sm text-gray-500">
            <p>
              © 2025 P.I.T.E.R – Plataforma de Integração e Transparência em
              Educação e Recursos
            </p>
            <p>Dados fornecidos pela API do Querido Diário • Projeto open-source</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
