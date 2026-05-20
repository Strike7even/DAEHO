// 직접 입력 필드 (15개)
export interface TransactionInput {
  lotNumber: string;        // 로트번호
  importDate: string;       // 수입일
  printType: string;        // 인쇄형태 (단면인쇄 | 양면인쇄)
  inboundQty: number;       // 입고수량(장)
  cardUnitPriceJpy: number; // 카드단가(엔)
  boxQty: number;           // 박스수량
  boxAmountJpy: number;     // 박스금액(엔)
  remittanceKrw: number;    // 송금액(원)
  customsFee: number;       // 통관비
  deliveryBoxQty: number;   // 납품박스수
  remainingQty: number;     // 잔량
  processingFee: number;    // 가공비(VAT포함)
  supplyUnitPrice: number;  // 공급단가 (기본 4530)
  invoiceRatio: number;     // 발행비율 (기본 0.9)
  receivedAmount: number;   // 입금액
}

// 자동계산 필드 (18개)
export interface TransactionCalc {
  cardCostJpy: number;          // 카드원가(엔) = 입고수량 × 카드단가
  remittanceJpy: number;        // 송금액(엔) = 카드원가 + 박스금액
  exchangeRate: number;         // 환율
  cardRemittanceKrw: number;    // 카드실송금액(원)
  deliveryQty: number;          // 납품수량(장) = 납품박스수 × 120
  defectQty: number;            // 불량수량
  defectRate: number;           // 불량률
  processingUnitPrice: number;  // 가공비단가
  priceBeforeProcessing: number;// 가공전 제품단가
  actualUnitPrice: number;      // 실제 제품단가
  totalDeliveryAmount: number;  // 총 납품금액
  totalCost: number;            // 총원가
  costRate: number;             // 원가율
  totalMargin: number;          // 총마진
  invoicedSales: number;        // 발행매출
  uninvoicedSales: number;      // 미발행매출
  invoiceMargin: number;        // 발행기준마진
  settlementBalance: number;    // 정산잔액
}

// 전체 트랜잭션
export type Transaction = TransactionInput & TransactionCalc & { id: number };

// 대시보드 요약
export interface DashboardSummary {
  totalSales: number;
  totalCost: number;
  totalMargin: number;
  avgMarginRate: number;
  avgDefectRate: number;
  lotCount: number;
  unsettledLots: number; // 정산잔액 > 0인 건수
}

// 설정값
export interface Settings {
  boxCapacity: number;      // 박스당 입수량 (120)
  defaultSupplyPrice: number; // 기본 공급단가 (4530)
  defaultInvoiceRatio: number; // 기본 발행비율 (0.9)
  vatRate: number;          // 부가세율 (0.1)
}

export const PRINT_TYPES = ['단면인쇄', '양면인쇄'] as const;
