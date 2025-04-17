import { CartItemType } from '../types/CartItems';

export function increaseCartItemQuantity(
  items: CartItemType[],
  targetId: string,
): CartItemType[] {
  return items.map((item) =>
    item.id === targetId ? { ...item, q: item.q + 1 } : item,
  );
}

export function decreaseCartItemQuantity(
  items: CartItemType[],
  targetId: string,
): CartItemType[] {
  return items.map((item) =>
    item.id === targetId ? { ...item, q: item.q - 1 } : item,
  );
}

export const updateProductStock = (
  productList: CartItemType[],
  id: string,
  change: number, // 음수면 감소, 양수면 증가
): CartItemType[] => {
  return productList.map((item) =>
    item.id === id ? { ...item, q: item.q + change } : item,
  );
};

/**
 * 할인 비율 적용
 * @param {*} price
 * @param {*} percent
 * @returns {number}
 */
export const getDiscountPrice = (price: number, percent: number) =>
  price * (1 - percent);

export const applyBestBulkDiscount = (
  totalBeforeDiscount: number,
  afterIndividualDiscount: number,
  bulkDiscountRate: number,
  EXTRA_DISCOUT_PERCENT?: number,
): { price: number; rate: number } => {
  const bulkDiscount: number = getBulkDiscountAmount(
    afterIndividualDiscount,
    bulkDiscountRate,
  );
  const individualDiscount: number = getIndividualDiscountAmount(
    totalBeforeDiscount,
    afterIndividualDiscount,
  );

  const shouldUseBulk: boolean = bulkDiscount > individualDiscount; // 대량 구매 할인 적용 여부

  return {
    price: shouldUseBulk
      ? totalBeforeDiscount * (1 - bulkDiscountRate)
      : afterIndividualDiscount,
    rate: shouldUseBulk
      ? bulkDiscountRate
      : individualDiscount / totalBeforeDiscount,
  };
};

/**
 * 대량 할인액 계산
 * @param {*} priceAfterIndividualDiscount
 * @param {*} bulkDiscountRate
 * @returns {number}
 * @description 대량 구매 할인은 개별 할인 적용 후 가격에 대해 적용됩니다.
 */
const getBulkDiscountAmount = (
  priceAfterIndividualDiscount: number,
  bulkDiscountRate: number,
) => priceAfterIndividualDiscount * bulkDiscountRate;

/**
 * 개별 할인액 계산
 * @param {*} totalBefore
 * @param {*} afterDiscount
 * @returns {number}
 * @description 개별 할인액은 전체 가격에서 할인 적용 후 가격을 뺀 값입니다.
 */
const getIndividualDiscountAmount = (
  totalBefore: number,
  afterDiscount: number,
) => totalBefore - afterDiscount;

/**
 * 화요일인지 여부
 * @returns {boolean}
 */
export const isTuesday = () => {
  return new Date().getDay() === 2;
};
