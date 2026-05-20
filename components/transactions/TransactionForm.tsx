'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculate } from '@/lib/calculations';
import type { TransactionInput } from '@/types/transaction';
import { PRINT_TYPES } from '@/types/transaction';
import { fmtNum, fmtKrw, fmtJpy, fmtRate, fmtExchange } from '@/lib/format';

type NumericKey = {
  [K in keyof TransactionInput]: TransactionInput[K] extends number ? K : never;
}[keyof TransactionInput];

interface Props {
  mode: 'create' | 'edit';
  transactionId?: number;
  initial?: Partial<TransactionInput>;
}

const DEFAULTS: TransactionInput = {
  lotNumber: '',
  importDate: '',
  printType: '단면인쇄',
  inboundQty: 0,
  cardUnitPriceJpy: 0,
  boxQty: 0,
  boxAmountJpy: 0,
  remittanceKrw: 0,
  customsFee: 0,
  deliveryBoxQty: 0,
  remainingQty: 0,
  processingFee: 0,
  supplyUnitPrice: 4530,
  invoiceRatio: 0.9,
  receivedAmount: 0,
};

export default function TransactionForm({ mode, transactionId, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<TransactionInput>({ ...DEFAULTS, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calc = calculate(values);

  function setNum(key: NumericKey) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
    };
  }

  function setText(key: keyof TransactionInput) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues(prev => ({ ...prev, [key]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.lotNumber.trim()) {
      setError('로트번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = mode === 'create' ? '/api/transactions' : `/api/transactions/${transactionId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '저장 실패');
      }
      router.push('/transactions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 기본정보 */}
      <Section title="기본정보" colorCls="bg-slate-400 text-slate-900" borderCls="border-slate-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="로트번호" required>
            <input
              type="text"
              value={values.lotNumber}
              onChange={setText('lotNumber')}
              placeholder="예: CY010"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>
          <Field label="수입일" required>
            <input
              type="date"
              value={values.importDate}
              onChange={setText('importDate')}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>
          <Field label="인쇄형태">
            <select
              value={values.printType}
              onChange={setText('printType')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {PRINT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* 수입원가 */}
      <Section title="수입원가" colorCls="bg-blue-400 text-blue-900" borderCls="border-blue-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumField label="입고수량 (장)" value={values.inboundQty} onChange={setNum('inboundQty')} />
          <NumField label="카드단가 (¥)" value={values.cardUnitPriceJpy} onChange={setNum('cardUnitPriceJpy')} step="0.01" />
          <CalcField label="카드원가 (¥)">{fmtJpy(calc.cardCostJpy)}</CalcField>
          <NumField label="박스수량" value={values.boxQty} onChange={setNum('boxQty')} />
          <NumField label="박스금액 (¥)" value={values.boxAmountJpy} onChange={setNum('boxAmountJpy')} />
          <CalcField label="송금액 (¥)">{fmtJpy(calc.remittanceJpy)}</CalcField>
          <NumField label="송금액 (원)" value={values.remittanceKrw} onChange={setNum('remittanceKrw')} />
          <CalcField label="환율">{fmtExchange(calc.exchangeRate)}</CalcField>
          <CalcField label="카드실송금액 (원)">{fmtKrw(calc.cardRemittanceKrw)}</CalcField>
          <NumField label="통관비 (원)" value={values.customsFee} onChange={setNum('customsFee')} />
        </div>
      </Section>

      {/* 가공/납품 */}
      <Section title="가공/납품" colorCls="bg-emerald-400 text-emerald-900" borderCls="border-emerald-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumField label="납품박스수" value={values.deliveryBoxQty} onChange={setNum('deliveryBoxQty')} />
          <CalcField label="납품수량 (장)">{fmtNum(calc.deliveryQty)}</CalcField>
          <NumField label="잔량" value={values.remainingQty} onChange={setNum('remainingQty')} />
          <CalcField label="불량수량">{fmtNum(calc.defectQty)}</CalcField>
          <CalcField label="불량률">{fmtRate(calc.defectRate)}</CalcField>
          <NumField label="가공비 (원, VAT포함)" value={values.processingFee} onChange={setNum('processingFee')} />
          <CalcField label="가공비단가">{fmtKrw(calc.processingUnitPrice)}</CalcField>
        </div>
      </Section>

      {/* 매출/단가 */}
      <Section title="매출/단가" colorCls="bg-violet-400 text-violet-900" borderCls="border-violet-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CalcField label="가공전 제품단가">{fmtKrw(calc.priceBeforeProcessing)}</CalcField>
          <CalcField label="실제 제품단가">{fmtKrw(calc.actualUnitPrice)}</CalcField>
          <NumField label="공급단가 (원)" value={values.supplyUnitPrice} onChange={setNum('supplyUnitPrice')} />
          <CalcField label="총 납품금액">{fmtKrw(calc.totalDeliveryAmount)}</CalcField>
        </div>
      </Section>

      {/* 수익성 */}
      <Section title="수익성" colorCls="bg-amber-400 text-amber-900" borderCls="border-amber-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CalcField label="총원가">{fmtKrw(calc.totalCost)}</CalcField>
          <CalcField label="원가율">{fmtRate(calc.costRate)}</CalcField>
          <CalcField label="총마진">
            <span className={calc.totalMargin >= 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
              {fmtKrw(calc.totalMargin)}
            </span>
          </CalcField>
        </div>
      </Section>

      {/* 세무/정산 */}
      <Section title="세무/정산" colorCls="bg-rose-400 text-rose-900" borderCls="border-rose-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="발행비율" hint="0~1 입력 (예: 0.9 = 90%)">
            <input
              type="number"
              value={values.invoiceRatio || ''}
              onChange={setNum('invoiceRatio')}
              min="0" max="1" step="0.01"
              placeholder="0.9"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>
          <CalcField label="발행매출">{fmtKrw(calc.invoicedSales)}</CalcField>
          <CalcField label="미발행매출">{fmtKrw(calc.uninvoicedSales)}</CalcField>
          <CalcField label="발행기준마진">
            <span className={calc.invoiceMargin >= 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
              {fmtKrw(calc.invoiceMargin)}
            </span>
          </CalcField>
          <NumField label="입금액 (원)" value={values.receivedAmount} onChange={setNum('receivedAmount')} />
          <CalcField label="정산잔액">
            <span className={calc.settlementBalance > 0 ? 'text-red-600 font-bold' : 'text-emerald-700 font-semibold'}>
              {fmtKrw(calc.settlementBalance)}
              {calc.settlementBalance > 0 && ' ⚠'}
            </span>
          </CalcField>
        </div>
      </Section>

      {/* 버튼 */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={() => router.push('/transactions')}
          className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? '저장 중…' : mode === 'create' ? '저장' : '수정 저장'}
        </button>
      </div>
    </form>
  );
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────

function Section({
  title,
  colorCls,
  borderCls,
  children,
}: {
  title: string;
  colorCls: string;
  borderCls: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`border ${borderCls} rounded-lg overflow-hidden`}>
      <div className={`${colorCls} px-4 py-2 font-semibold text-sm`}>{title}</div>
      <div className="p-4 bg-white">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1 text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value || ''}
        onChange={onChange}
        min="0"
        step={step ?? '1'}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </Field>
  );
}

function CalcField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Field label={label} hint="(자동)">
      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 italic min-h-[38px]">
        {children}
      </div>
    </Field>
  );
}
