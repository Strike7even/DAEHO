'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Transaction } from '@/types/transaction';
import { fmtNum, fmtKrw, fmtJpy, fmtRate, fmtExchange } from '@/lib/format';

type ColFormat = 'text' | 'num' | 'krw' | 'jpy' | 'rate' | 'exchange';

interface Col {
  key: keyof Transaction;
  label: string;
  format: ColFormat;
  calc?: boolean;
}

interface Group {
  name: string;
  headerCls: string;
  inputColCls: string;
  calcColCls: string;
  cols: Col[];
}

const GROUPS: Group[] = [
  {
    name: '기본정보',
    headerCls: 'bg-slate-400 text-slate-900',
    inputColCls: 'bg-slate-100',
    calcColCls: 'bg-slate-200',
    cols: [
      { key: 'lotNumber', label: '로트번호', format: 'text' },
      { key: 'importDate', label: '수입일', format: 'text' },
      { key: 'printType', label: '인쇄형태', format: 'text' },
    ],
  },
  {
    name: '수입원가',
    headerCls: 'bg-blue-400 text-blue-900',
    inputColCls: 'bg-blue-50',
    calcColCls: 'bg-blue-200',
    cols: [
      { key: 'inboundQty', label: '입고수량', format: 'num' },
      { key: 'cardUnitPriceJpy', label: '카드단가(¥)', format: 'jpy' },
      { key: 'cardCostJpy', label: '카드원가(¥)', format: 'jpy', calc: true },
      { key: 'boxQty', label: '박스수량', format: 'num' },
      { key: 'boxAmountJpy', label: '박스금액(¥)', format: 'jpy' },
      { key: 'remittanceJpy', label: '송금액(¥)', format: 'jpy', calc: true },
      { key: 'remittanceKrw', label: '송금액(₩)', format: 'krw' },
      { key: 'exchangeRate', label: '환율', format: 'exchange', calc: true },
      { key: 'cardRemittanceKrw', label: '카드실송금(₩)', format: 'krw', calc: true },
      { key: 'customsFee', label: '통관비', format: 'krw' },
    ],
  },
  {
    name: '가공/납품',
    headerCls: 'bg-emerald-400 text-emerald-900',
    inputColCls: 'bg-emerald-50',
    calcColCls: 'bg-emerald-200',
    cols: [
      { key: 'deliveryBoxQty', label: '납품박스수', format: 'num' },
      { key: 'deliveryQty', label: '납품수량', format: 'num', calc: true },
      { key: 'remainingQty', label: '잔량', format: 'num' },
      { key: 'defectQty', label: '불량수량', format: 'num', calc: true },
      { key: 'defectRate', label: '불량률', format: 'rate', calc: true },
      { key: 'processingFee', label: '가공비', format: 'krw' },
      { key: 'processingUnitPrice', label: '가공비단가', format: 'krw', calc: true },
    ],
  },
  {
    name: '매출/단가',
    headerCls: 'bg-violet-400 text-violet-900',
    inputColCls: 'bg-violet-50',
    calcColCls: 'bg-violet-200',
    cols: [
      { key: 'priceBeforeProcessing', label: '가공전단가', format: 'krw', calc: true },
      { key: 'actualUnitPrice', label: '실제단가', format: 'krw', calc: true },
      { key: 'supplyUnitPrice', label: '공급단가', format: 'krw' },
      { key: 'totalDeliveryAmount', label: '총납품금액', format: 'krw', calc: true },
    ],
  },
  {
    name: '수익성',
    headerCls: 'bg-amber-400 text-amber-900',
    inputColCls: 'bg-amber-50',
    calcColCls: 'bg-amber-200',
    cols: [
      { key: 'totalCost', label: '총원가', format: 'krw', calc: true },
      { key: 'costRate', label: '원가율', format: 'rate', calc: true },
      { key: 'totalMargin', label: '총마진', format: 'krw', calc: true },
    ],
  },
  {
    name: '세무/정산',
    headerCls: 'bg-rose-400 text-rose-900',
    inputColCls: 'bg-rose-50',
    calcColCls: 'bg-rose-200',
    cols: [
      { key: 'invoiceRatio', label: '발행비율', format: 'rate' },
      { key: 'invoicedSales', label: '발행매출', format: 'krw', calc: true },
      { key: 'uninvoicedSales', label: '미발행매출', format: 'krw', calc: true },
      { key: 'invoiceMargin', label: '발행기준마진', format: 'krw', calc: true },
      { key: 'receivedAmount', label: '입금액', format: 'krw' },
      { key: 'settlementBalance', label: '정산잔액', format: 'krw', calc: true },
    ],
  },
];

function formatCell(value: unknown, format: ColFormat): string {
  const n = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  switch (format) {
    case 'text': return String(value ?? '');
    case 'num': return fmtNum(n);
    case 'krw': return fmtKrw(n);
    case 'jpy': return fmtJpy(n);
    case 'rate': return fmtRate(n);
    case 'exchange': return fmtExchange(n);
  }
}

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number, lotNumber: string) {
    if (!confirm(`[${lotNumber}] 로트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      router.refresh();
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
      setDeletingId(null);
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        등록된 거래내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="text-xs border-collapse whitespace-nowrap">
        <thead>
          {/* 그룹 헤더 */}
          <tr>
            {GROUPS.map(g => (
              <th
                key={g.name}
                colSpan={g.cols.length}
                className={`${g.headerCls} font-semibold text-center px-2 py-1.5 border border-gray-300`}
              >
                {g.name}
              </th>
            ))}
            <th className="bg-gray-300 text-gray-900 font-semibold text-center px-2 py-1.5 border border-gray-300">
              작업
            </th>
          </tr>
          {/* 컬럼 헤더 */}
          <tr>
            {GROUPS.flatMap(g =>
              g.cols.map(col => (
                <th
                  key={col.key}
                  title={col.calc ? '자동계산' : '직접입력'}
                  className={`${col.calc ? g.calcColCls : g.inputColCls} font-medium text-center px-2 py-1.5 border border-gray-300`}
                >
                  {col.label}
                  {col.calc && <span className="text-gray-400 ml-0.5">*</span>}
                </th>
              ))
            )}
            <th className="bg-gray-100 px-2 py-1.5 border border-gray-300 min-w-[80px]" />
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => {
            const isUnsettled = (t.settlementBalance as number) > 0;
            return (
              <tr
                key={t.id}
                className={`hover:brightness-95 transition-all ${
                  isUnsettled ? 'bg-yellow-50' : 'bg-white'
                }`}
              >
                {GROUPS.flatMap(g =>
                  g.cols.map(col => {
                    const isSettlementBalance = col.key === 'settlementBalance';
                    const isLotNumber = col.key === 'lotNumber';

                    const base = 'px-2 py-1 border border-gray-200';
                    const align = isLotNumber ? 'text-left font-semibold text-gray-800' : 'text-right';
                    let accent = '';
                    if (isSettlementBalance) {
                      accent = isUnsettled ? 'text-red-600 font-bold' : 'text-emerald-700 font-semibold';
                    } else if (col.calc) {
                      accent = 'text-gray-500 italic';
                    }

                    return (
                      <td
                        key={col.key}
                        className={[base, align, accent].filter(Boolean).join(' ')}
                      >
                        {formatCell(t[col.key], col.format)}
                      </td>
                    );
                  })
                )}
                <td className="px-2 py-1 border border-gray-200 text-center">
                  <div className="flex gap-1 justify-center">
                    <Link
                      href={`/transactions/${t.id}`}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id, t.lotNumber)}
                      disabled={deletingId === t.id}
                      className="px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {deletingId === t.id ? '…' : '삭제'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        * 표시된 컬럼은 자동계산 값입니다. 총 {transactions.length}건
      </div>
    </div>
  );
}
