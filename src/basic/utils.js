/**
 * 할인 비율 적용
 * @param {*} price
 * @param {*} percent
 * @returns {number}
 */
export const getDiscountPrice = (price, percent) => price * (1 - percent);

/**
 * 화요일인지 여부
 * @returns {boolean}
 */
export const isTuesday = () => {
  return new Date().getDay() === 2;
};

/**
 * 상품 목록에서 ID로 상품 찾기
 * @param {*} prodList
 * @param {*} id
 * @returns {object}
 */
export const getProductById = (prodList, id) => {
  return prodList.find((product) => product.id === id);
};

/**
 * 텍스트에서 수량 파싱 (예: 'x 3' → 3)
 * @param {*} text
 * @param {*} separator
 * @returns
 */
export const getQuantityFromText = (
  text,
  separator = QUANTITY_TEXT_SEPARATOR,
) => {
  return parseInt(text.split(separator)[1], 10);
};

/**
 * 텍스트로부터 수량 + 변화량 계산 (예: 'x 3' + 1 -> 4)
 * @param {*} text
 * @param {*} change
 * @param {*} separator
 * @returns {number}
 */
export const getUpdatedQuantity = (
  text,
  change,
  separator = QUANTITY_TEXT_SEPARATOR,
) => {
  const currentQuantity = getQuantityFromText(text, separator);
  return currentQuantity + change;
};

/**
 * 상품 표시 텍스트 포맷팅
 * @param {*} name
 * @param {*} price
 * @param {*} quantity
 * @param {*} separator
 * @returns {string}
 */
export const formatProductDisplayText = (
  name,
  price,
  quantity,
  separator = QUANTITY_TEXT_SEPARATOR,
) => {
  return `${name} - ${price}원 ${separator}${quantity}`;
};

/**
 * 대량 할인액 계산
 * @param {*} priceAfterIndividualDiscount
 * @param {*} bulkDiscountRate
 * @returns {number}
 * @description 대량 구매 할인은 개별 할인 적용 후 가격에 대해 적용됩니다.
 */
const getBulkDiscountAmount = (
  priceAfterIndividualDiscount,
  bulkDiscountRate,
) => priceAfterIndividualDiscount * bulkDiscountRate;

/**
 * 개별 할인액 계산
 * @param {*} totalBefore
 * @param {*} afterDiscount
 * @returns {number}
 * @description 개별 할인액은 전체 가격에서 할인 적용 후 가격을 뺀 값입니다.
 */
const getIndividualDiscountAmount = (totalBefore, afterDiscount) =>
  totalBefore - afterDiscount;

/**
 * 대량 구매 할인과 개별 할인 중 더 유리한 할인 적용
 * @param {*} totalBeforeDiscount // 할인 적용 전 총 가격
 * @param {*} afterIndividualDiscount // 할인 적용 후 가격
 * @param {*} bulkDiscountRate // 대량 구매 할인율
 * @description 대량 구매 할인은 개별 할인 적용 후 가격에 대해 적용됩니다.
 * @returns {object}
 * @property {number} price - 할인 적용 후 가격
 * @property {number} rate - 할인율
 * @property {boolean} shouldUseBulk - 대량 구매 할인 적용 여부
 * @property {number} bulkDiscount - 대량 구매 할인액
 * @property {number} individualDiscount - 개별 할인액
 */
export const applyBestBulkDiscount = (
  totalBeforeDiscount,
  afterIndividualDiscount,
  bulkDiscountRate,
) => {
  const bulkDiscount = getBulkDiscountAmount(
    afterIndividualDiscount,
    bulkDiscountRate,
  );
  const individualDiscount = getIndividualDiscountAmount(
    totalBeforeDiscount,
    afterIndividualDiscount,
  );

  const shouldUseBulk = bulkDiscount > individualDiscount; // 대량 구매 할인 적용 여부

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
 * 유효한 수량인지 확인
 * @param {*} updated
 * @param {*} available
 * @param {*} currentInCart
 * @returns
 */
export const isValidUpdatedQuantity = (updated, available, currentInCart) =>
  updated > 0 && updated <= available + currentInCart;
