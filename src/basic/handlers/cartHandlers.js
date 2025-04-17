// @ts-nocheck
import {
  CLASS_PRODUCT_WRAPPER,
  CLASS_BTN_QUANTITY,
  CLASS_BTN_REMOVE,
} from '../constants/className';
import {
  DATASET_KEY_CHANGE,
  DATASET_KEY_PRODUCT_ID,
  QUANTITY_TEXT_SEPARATOR,
} from '../constants/datasetKeys';
import { cartDisplay, dom } from '../main.basic';
import { state } from '../state';
import {
  getProductById,
  getUpdatedQuantity,
  formatProductDisplayText,
  calculateCart,
  getQuantityFromText,
  isValidUpdatedQuantity,
} from '../utils';

/**
 * 장바구니에 상품 추가 버튼 클릭 이벤트 핸들러
 */
export const handleAddCartClick = () => {
  const selectedProductId = dom.select.value; // 선택된 상품 ID
  const itemToAdd = getProductById(state.prodList, selectedProductId); // 선택된 상품

  if (itemToAdd && itemToAdd.q > 0) {
    const item = document.getElementById(itemToAdd.id);

    if (item && item !== null) {
      // 이미 장바구니에 있는 상품일 경우
      const updatedQuantity = getUpdatedQuantity(
        item.querySelector('span').textContent,
        1,
        QUANTITY_TEXT_SEPARATOR,
      );

      if (updatedQuantity <= itemToAdd.q) {
        const spanElement = item.querySelector('span');

        // 수량 업데이트
        if (spanElement) {
          spanElement.textContent = formatProductDisplayText(
            itemToAdd.name,
            itemToAdd.val,
            updatedQuantity,
            QUANTITY_TEXT_SEPARATOR,
          );
        } else {
          console.error('Span element not found for item:', itemToAdd.id);
        }
        itemToAdd.q--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className = CLASS_PRODUCT_WRAPPER;
      newItem.innerHTML =
        `<span>${formatProductDisplayText(itemToAdd.name, itemToAdd.val, 1, QUANTITY_TEXT_SEPARATOR)}</span><div>` +
        `<button class="${CLASS_BTN_QUANTITY}" data-product-id="` +
        itemToAdd.id +
        '" data-change="-1">-</button>' +
        `<button class="${CLASS_BTN_QUANTITY}" data-product-id="` +
        itemToAdd.id +
        '" data-change="1">+</button>' +
        `<button class="${CLASS_BTN_REMOVE}" data-product-id="` +
        itemToAdd.id +
        '">삭제</button></div>';
      cartDisplay.appendChild(newItem);
      itemToAdd.q--;
    }
    calculateCart();
    state.lastSelectedProductId = selectedProductId;
  }
};

/**
 * 장바구니 아이템 수량 변경 및 삭제 이벤트 핸들러 (이벤트 위임)
 */
export const handleCartItemClick = (event) => {
  const target = event.target;

  if (
    (target instanceof HTMLElement &&
      target.classList.contains('quantity-change')) ||
    (target instanceof HTMLElement && target.classList.contains('remove-item'))
  ) {
    const targetProductId = target.dataset[DATASET_KEY_PRODUCT_ID]; // target
    const itemElement = targetProductId
      ? document.getElementById(targetProductId)
      : null;
    const selectedProduct = getProductById(state.prodList, targetProductId); // 상품 찾기

    // 이벤트 델리게이션이나 특정 요소만 조건 분기할 때 자주 씀
    if (
      target.classList.contains('quantity-change') &&
      selectedProduct &&
      itemElement &&
      itemElement.querySelector('span')?.textContent
    ) {
      // 수량 변경 버튼 클릭
      const currentQuantity = parseInt(
        target.dataset[DATASET_KEY_CHANGE] || '0',
      );
      // 수량 변경
      const updatedQuantity = getUpdatedQuantity(
        itemElement.querySelector('span').textContent,
        currentQuantity,
        QUANTITY_TEXT_SEPARATOR,
      );
      if (
        isValidUpdatedQuantity(
          updatedQuantity,
          selectedProduct.q,
          getQuantityFromText(
            itemElement.querySelector('span').textContent,
            QUANTITY_TEXT_SEPARATOR,
          ),
        )
      ) {
        itemElement.querySelector('span').textContent =
          formatProductDisplayText(
            selectedProduct.name,
            selectedProduct.val,
            updatedQuantity,
            QUANTITY_TEXT_SEPARATOR,
          );

        selectedProduct.q -= currentQuantity;
      } else if (updatedQuantity <= 0) {
        itemElement.remove();
        selectedProduct.q -= currentQuantity;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (target.classList.contains('remove-item')) {
      const selectedQuantity = getQuantityFromText(
        itemElement.querySelector('span').textContent,
        QUANTITY_TEXT_SEPARATOR,
      );
      selectedProduct.q += selectedQuantity;
      itemElement.remove();
    }
    calculateCart();
  }
};
