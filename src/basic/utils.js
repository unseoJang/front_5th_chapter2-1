// @ts-nocheck
import { CLASS_DISCOUNT_TAG, CLASS_POINTS_TAG } from './constants/className';
import { QUANTITY_TEXT_SEPARATOR } from './constants/datasetKeys';
import {
  BULE_PURCHASE_PRODUCT_THRESHOLD,
  BULK_PURCHASE_THRESHOLD,
  EXTRA_DISCOUT_PERCENT,
  PRODUCT_DISCOUT_MAP,
  TUESDAY_DISCOUNT_AMOUNT_PERCENT,
} from './constants/discount';
import { cartDisplay, dom, stockStatus, totalDisplay } from './main.basic';
import { state } from './state';

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
  EXTRA_DISCOUT_PERCENT,
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

/**
 * 상품 선택 옵션 업데이트
 */
export const updateProductOption = () => {
  const select = dom.select;
  if (dom.select) {
    select.innerHTML = '';
  }

  state.prodList.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name + ' - ' + item.val + '원';

    if (item.q === 0) option.disabled = true;

    select.appendChild(option);
  });
};

/**
 * 포인트 랜더링
 */
export const renderBonusPoints = () => {
  state.bonusPoints = Math.floor(state.finalPaymentAmount / 1000);
  let pointsTag = document.getElementById('loyalty-points');
  if (!pointsTag) {
    pointsTag = document.createElement('span');
    pointsTag.id = 'loyalty-points';
    pointsTag.className = CLASS_POINTS_TAG;
    totalDisplay.appendChild(pointsTag);
  }
  pointsTag.textContent = '(포인트: ' + state.bonusPoints + ')';
};

/**
 * 재고 정보 업데이트
 */
export const updateStockStatus = () => {
  let infoMsg = '';
  state.prodList.forEach((item) => {
    if (item.q < 5) {
      infoMsg +=
        item.name +
        ': ' +
        (item.q > 0 ? '재고 부족 (' + item.q + '개 남음)' : '품절') +
        '\n';
    }
  });
  stockStatus.textContent = infoMsg;
};

/**
 * 장바구니 계산 함수
 */
export function calculateCart() {
  state.finalPaymentAmount = 0; // 최종 결제 금액
  state.cartAllItemCount = 0; // 카트 전체 상품 갯수
  const cartItems = cartDisplay.children; // 장바구니에 담긴 상품들
  let cartAllItemPrice = 0; // 카트 전체 상품 가격

  // 장바구니에 담긴 상품들
  for (const cartItem of cartItems) {
    const productId = cartItem.id;
    const currentProduct = getProductById(state.prodList, productId);
    const quantity = getQuantityFromText(
      cartItem.querySelector('span').textContent,
      QUANTITY_TEXT_SEPARATOR,
    );

    const productPrice = currentProduct.val * quantity;
    const productDiscount =
      quantity >= BULE_PURCHASE_PRODUCT_THRESHOLD
        ? PRODUCT_DISCOUT_MAP[currentProduct.id] || 0
        : 0;

    state.cartAllItemCount += quantity;
    cartAllItemPrice += productPrice;
    state.finalPaymentAmount += getDiscountPrice(productPrice, productDiscount);
  }

  let discountPercent = 0; // 할인율

  // 전체 수량이 30개 이상일때 적용할 수 있는 대량 구매 할인
  if (state.cartAllItemCount >= BULK_PURCHASE_THRESHOLD) {
    const { price, rate } = applyBestBulkDiscount(
      cartAllItemPrice,
      state.finalPaymentAmount,
      BULK_PURCHASE_THRESHOLD,
      EXTRA_DISCOUT_PERCENT,
    );
    state.finalPaymentAmount = price;
    discountPercent = rate;
  } else {
    discountPercent =
      (cartAllItemPrice - state.finalPaymentAmount) / cartAllItemPrice;
  }

  // 화요일 할인 적용
  if (isTuesday()) {
    state.finalPaymentAmount *= 1 - TUESDAY_DISCOUNT_AMOUNT_PERCENT;
    discountPercent = Math.max(
      discountPercent,
      TUESDAY_DISCOUNT_AMOUNT_PERCENT,
    );
  }

  // 할인율이 0보다 클 경우
  totalDisplay.textContent =
    '총액: ' + Math.round(state.finalPaymentAmount) + '원';

  // 할인율이 0보다 클 경우
  if (discountPercent > 0) {
    const span = document.createElement('span');
    span.className = CLASS_DISCOUNT_TAG;
    span.textContent =
      '(' + (discountPercent * 100).toFixed(1) + '% 할인 적용)';
    totalDisplay.appendChild(span);
  }

  // 재고 정보 업데이트
  updateStockStatus();
  renderBonusPoints();
}
