import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: '거래내역 | Sales Dashboard',
};

export default function TransactionsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-semibold text-gray-900">Sales Dashboard</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 transition-colors">
              대시보드
            </Link>
            <Link href="/transactions" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              거래내역
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
