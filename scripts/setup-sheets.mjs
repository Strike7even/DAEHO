/**
 * 구글 시트 초기 설정 스크립트
 * 실행: node scripts/setup-sheets.mjs
 *
 * 사전 준비:
 * 1. .env.local에 GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SPREADSHEET_ID 입력
 * 2. 구글 시트에 서비스 계정 이메일을 편집자로 공유
 */

import { readFileSync } from 'fs';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// 계산 함수
function calculate(input) {
  const BOX_CAPACITY = 120;
  const { inboundQty, cardUnitPriceJpy, boxAmountJpy, remittanceKrw,
          customsFee, deliveryBoxQty, remainingQty, processingFee,
          supplyUnitPrice, invoiceRatio, receivedAmount } = input;

  const cardCostJpy = inboundQty * cardUnitPriceJpy;
  const remittanceJpy = cardCostJpy + boxAmountJpy;
  const exchangeRate = remittanceJpy === 0 ? 0 : (remittanceKrw / remittanceJpy) * 100;
  const cardRemittanceKrw = remittanceKrw - (boxAmountJpy * exchangeRate / 100);
  const deliveryQty = deliveryBoxQty * BOX_CAPACITY;
  const defectQty = inboundQty - deliveryQty - remainingQty;
  const defectRate = deliveryQty === 0 ? 0 : defectQty / deliveryQty;
  const processingUnitPrice = deliveryQty === 0 ? 0 : processingFee / deliveryQty;
  const priceBeforeProcessing = deliveryQty === 0 ? 0 : (cardRemittanceKrw + customsFee) / deliveryQty;
  const actualUnitPrice = deliveryQty === 0 ? 0 : (cardRemittanceKrw + customsFee + processingFee) / deliveryQty;
  const totalDeliveryAmount = deliveryQty * supplyUnitPrice;
  const totalCost = remittanceKrw + customsFee + processingFee;
  const costRate = totalDeliveryAmount === 0 ? 0 : totalCost / totalDeliveryAmount;
  const totalMargin = totalDeliveryAmount - totalCost;
  const invoicedSales = totalDeliveryAmount * invoiceRatio;
  const uninvoicedSales = totalDeliveryAmount * (1 - invoiceRatio);
  const invoiceMargin = invoicedSales - totalCost;
  const settlementBalance = invoicedSales - receivedAmount;

  return { cardCostJpy, remittanceJpy, exchangeRate, cardRemittanceKrw,
           deliveryQty, defectQty, defectRate, processingUnitPrice,
           priceBeforeProcessing, actualUnitPrice, totalDeliveryAmount,
           totalCost, costRate, totalMargin, invoicedSales, uninvoicedSales,
           invoiceMargin, settlementBalance };
}

function toRow(input, calc) {
  return [
    input.lotNumber, input.importDate, input.printType,
    input.inboundQty, input.cardUnitPriceJpy,
    calc.cardCostJpy, input.boxQty, input.boxAmountJpy,
    calc.remittanceJpy, input.remittanceKrw, calc.exchangeRate, calc.cardRemittanceKrw,
    input.customsFee, input.deliveryBoxQty, calc.deliveryQty, calc.defectQty,
    input.remainingQty, calc.defectRate, input.processingFee, calc.processingUnitPrice,
    calc.priceBeforeProcessing, calc.actualUnitPrice, input.supplyUnitPrice,
    calc.totalDeliveryAmount, calc.totalCost, calc.costRate, calc.totalMargin,
    input.invoiceRatio, calc.invoicedSales, calc.uninvoicedSales, calc.invoiceMargin,
    input.receivedAmount, calc.settlementBalance,
  ];
}

async function main() {
  console.log('🚀 구글 시트 초기화 시작...');

  const auth = await getAuth().getClient();
  const sheets = google.sheets({ version: 'v4', auth });

  // 헤더 작성
  const headers1 = [
    '기본정보', '', '', '수입원가', '', '', '', '', '', '', '', '', '',
    '가공/납품', '', '', '', '', '', '',
    '매출/단가', '', '', '',
    '수익성', '', '',
    '세무/정산', '', '', '', '', ''
  ];
  const headers2 = [
    '로트번호', '수입일', '인쇄형태',
    '입고수량(장)', '카드단가(엔)', '카드원가(엔)', '박스수량', '박스금액(엔)',
    '송금액(엔)', '송금액(원)', '환율', '카드실송금액(원)', '통관비',
    '납품박스수', '납품수량(장)', '불량수량', '잔량', '불량률', '가공비(VAT포함)', '가공비단가',
    '가공전 제품단가', '실제 제품단가', '공급단가', '총 납품금액',
    '총원가', '원가율', '총마진',
    '발행비율', '발행매출', '미발행매출', '발행기준마진', '입금액', '정산잔액'
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: '거래내역!A1:AG2',
    valueInputOption: 'RAW',
    requestBody: { values: [headers1, headers2] },
  });
  console.log('✅ 헤더 작성 완료');

  // 데이터 시드
  const seedData = JSON.parse(
    readFileSync(join(__dirname, 'seed-data.json'), 'utf8')
  );

  const rows = seedData.map(input => toRow(input, calculate(input)));

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `거래내역!A3:AG${3 + rows.length - 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`✅ 데이터 ${rows.length}건 이전 완료`);

  // 설정 시트 작성
  const settingsData = [
    ['설정값 (Constants)', '', ''],
    ['', '', ''],
    ['항목', '값', '설명'],
    ['박스당 입수량', 120, '1박스당 카드 장수'],
    ['기본 공급단가', 4530, '총판 납품 단가 (원/장)'],
    ['기본 발행비율', 0.9, '현행 세금계산서 발행 비율 (CY020~)'],
    ['부가세율', 0.1, '참고용'],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: '설정!A1:C7',
    valueInputOption: 'RAW',
    requestBody: { values: settingsData },
  });
  console.log('✅ 설정 시트 작성 완료');

  console.log('\n🎉 구글 시트 초기화 완료!');
  console.log('이제 .env.local 설정 확인 후 npm run dev를 실행하세요.');
}

main().catch(console.error);
