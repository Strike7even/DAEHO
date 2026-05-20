import { google } from 'googleapis';
import type { Transaction, TransactionInput, Settings } from '@/types/transaction';
import { calculate } from './calculations';

const SHEET_NAME = '거래내역';
const DATA_START_ROW = 3; // 1행: 그룹헤더, 2행: 컬럼헤더, 3행~: 데이터

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: stripBom(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? ''),
      private_key: stripBom(process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheets() {
  const auth = await getAuth().getClient();
  return google.sheets({ version: 'v4', auth: auth as never });
}

const SPREADSHEET_ID = () => process.env.GOOGLE_SPREADSHEET_ID!;

// 행 데이터를 Transaction 객체로 변환
function rowToTransaction(row: (string | number)[], rowIndex: number): Transaction {
  const n = (v: string | number) => parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;

  const input: TransactionInput = {
    lotNumber: String(row[0] ?? ''),
    importDate: String(row[1] ?? ''),
    printType: String(row[2] ?? ''),
    inboundQty: n(row[3]),
    cardUnitPriceJpy: n(row[4]),
    boxQty: n(row[6]),
    boxAmountJpy: n(row[7]),
    remittanceKrw: n(row[9]),
    customsFee: n(row[12]),
    deliveryBoxQty: n(row[13]),
    remainingQty: n(row[16]),
    processingFee: n(row[18]),
    supplyUnitPrice: n(row[22]),
    invoiceRatio: n(row[27]),
    receivedAmount: n(row[31]),
  };

  const calc = calculate(input);

  return { id: rowIndex, ...input, ...calc };
}

// Transaction을 시트 행 배열로 변환 (33컬럼)
function transactionToRow(input: TransactionInput, calc: ReturnType<typeof calculate>): (string | number)[] {
  return [
    input.lotNumber,           // A: 로트번호
    input.importDate,          // B: 수입일
    input.printType,           // C: 인쇄형태
    input.inboundQty,          // D: 입고수량(장)
    input.cardUnitPriceJpy,    // E: 카드단가(엔)
    calc.cardCostJpy,          // F: 카드원가(엔) [자동]
    input.boxQty,              // G: 박스수량
    input.boxAmountJpy,        // H: 박스금액(엔)
    calc.remittanceJpy,        // I: 송금액(엔) [자동]
    input.remittanceKrw,       // J: 송금액(원)
    calc.exchangeRate,         // K: 환율 [자동]
    calc.cardRemittanceKrw,    // L: 카드실송금액(원) [자동]
    input.customsFee,          // M: 통관비
    input.deliveryBoxQty,      // N: 납품박스수
    calc.deliveryQty,          // O: 납품수량(장) [자동]
    calc.defectQty,            // P: 불량수량 [자동]
    input.remainingQty,        // Q: 잔량
    calc.defectRate,           // R: 불량률 [자동]
    input.processingFee,       // S: 가공비(VAT포함)
    calc.processingUnitPrice,  // T: 가공비단가 [자동]
    calc.priceBeforeProcessing,// U: 가공전 제품단가 [자동]
    calc.actualUnitPrice,      // V: 실제 제품단가 [자동]
    input.supplyUnitPrice,     // W: 공급단가
    calc.totalDeliveryAmount,  // X: 총 납품금액 [자동]
    calc.totalCost,            // Y: 총원가 [자동]
    calc.costRate,             // Z: 원가율 [자동]
    calc.totalMargin,          // AA: 총마진 [자동]
    input.invoiceRatio,        // AB: 발행비율
    calc.invoicedSales,        // AC: 발행매출 [자동]
    calc.uninvoicedSales,      // AD: 미발행매출 [자동]
    calc.invoiceMargin,        // AE: 발행기준마진 [자동]
    input.receivedAmount,      // AF: 입금액
    calc.settlementBalance,    // AG: 정산잔액 [자동]
  ];
}

// 전체 거래내역 조회
export async function getAllTransactions(): Promise<Transaction[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_NAME}!A${DATA_START_ROW}:AG`,
  });

  const rows = res.data.values ?? [];
  return rows
    .filter(row => row[0]) // 빈 행 제외
    .map((row, idx) => rowToTransaction(row, idx + DATA_START_ROW));
}

// 단일 거래내역 조회
export async function getTransaction(rowIndex: number): Promise<Transaction | null> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_NAME}!A${rowIndex}:AG${rowIndex}`,
  });

  const row = res.data.values?.[0];
  if (!row || !row[0]) return null;
  return rowToTransaction(row, rowIndex);
}

// 거래내역 추가
export async function addTransaction(input: TransactionInput): Promise<Transaction> {
  const sheets = await getSheets();
  const calc = calculate(input);
  const rowData = transactionToRow(input, calc);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_NAME}!A${DATA_START_ROW}`,
    valueInputOption: 'RAW',
    requestBody: { values: [rowData] },
  });

  // 전체 다시 읽어서 마지막 ID 반환
  const all = await getAllTransactions();
  const last = all[all.length - 1];
  return last;
}

// 거래내역 수정
export async function updateTransaction(rowIndex: number, input: TransactionInput): Promise<Transaction> {
  const sheets = await getSheets();
  const calc = calculate(input);
  const rowData = transactionToRow(input, calc);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${SHEET_NAME}!A${rowIndex}:AG${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [rowData] },
  });

  return { id: rowIndex, ...input, ...calc };
}

// 거래내역 삭제
export async function deleteTransaction(rowIndex: number): Promise<void> {
  const sheets = await getSheets();

  // 시트 ID 가져오기
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID(),
  });
  const sheet = spreadsheet.data.sheets?.find(
    s => s.properties?.title === SHEET_NAME
  );
  const sheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID(),
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1, // 0-based
            endIndex: rowIndex,
          },
        },
      }],
    },
  });
}

// 설정값 조회
export async function getSettings(): Promise<Settings> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: '설정!B4:B7',
  });
  const vals = res.data.values ?? [];
  return {
    boxCapacity: parseFloat(String(vals[0]?.[0])) || 120,
    defaultSupplyPrice: parseFloat(String(vals[1]?.[0])) || 4530,
    defaultInvoiceRatio: parseFloat(String(vals[2]?.[0])) || 0.9,
    vatRate: parseFloat(String(vals[3]?.[0])) || 0.1,
  };
}
