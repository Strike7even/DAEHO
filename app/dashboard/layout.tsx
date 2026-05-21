import Link from 'next/link';
import type { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: '대시보드 | Sales Dashboard',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-semibold text-gray-900 dark:text-white">Sales Dashboard</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-blue-600 font-medium hover:text-blue-500 transition-colors">
              대시보드
            </Link>
            <Link href="/transactions" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              거래내역
            </Link>
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
