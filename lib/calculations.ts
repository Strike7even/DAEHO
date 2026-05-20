import type { TransactionInput, TransactionCalc } from '@/types/transaction';

const BOX_CAPACITY = 120;

export function calculate(input: TransactionInput): TransactionCalc {
  const {
    inboundQty,
    cardUnitPriceJpy,
    boxQty,
    boxAmountJpy,
    remittanceKrw,
    customsFee,
    deliveryBoxQty,
    remainingQty,
    processingFee,
    supplyUnitPrice,
    invoiceRatio,
    receivedAmount,
  } = input;

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

  return {
    cardCostJpy,
    remittanceJpy,
    exchangeRate,
    cardRemittanceKrw,
    deliveryQty,
    defectQty,
    defectRate,
    processingUnitPrice,
    priceBeforeProcessing,
    actualUnitPrice,
    totalDeliveryAmount,
    totalCost,
    costRate,
    totalMargin,
    invoicedSales,
    uninvoicedSales,
    invoiceMargin,
    settlementBalance,
  };
}
