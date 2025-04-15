import {
  getProductById,
  getUpdatedQuantity,
  getQuantityFromText,
  formatProductDisplayText,
  isValidUpdatedQuantity,
  createCartItemElement,
} from '../utils/cartUtils.js';

import {
  CLASS_PRODUCT_WRAPPER,
  CLASS_BTN_QUANTITY,
  CLASS_BTN_REMOVE,
} from '../constants/className.js';

import {
  DATASET_KEY_PRODUCT_ID,
  DATASET_KEY_CHANGE,
  QUANTITY_TEXT_SEPARATOR,
} from '../constants/datasetKeys.js';

import { state } from '../state.js';

/**
 * 장바구니에 상품 추가 핸들러 설정
 * @param {*} buttonElement
 * @param {*} selectElement
 * @param {*} cartDisplay
 * @param {*} calculateCart
 */
export const setupAddToCartHandler = (
  buttonElement,
  selectElement,
  cartDisplay,
  calculateCart,
) => {
  buttonElement.addEventListener('click', () => {
    const selectedProductId = selectElement.value; // 선택된 상품 ID
    const itemToAdd = getProductById(state.prodList, selectedProductId);

    if (itemToAdd && itemToAdd.q > 0) {
      const item = document.getElementById(itemToAdd.id);

      if (item) {
        const updatedQuantity = getUpdatedQuantity(
          item.querySelector('span').textContent,
          1,
          QUANTITY_TEXT_SEPARATOR,
        );

        if (updatedQuantity <= itemToAdd.q) {
          const spanElement = item.querySelector('span');
          if (spanElement) {
            spanElement.textContent = formatProductDisplayText(
              itemToAdd.name,
              itemToAdd.val,
              updatedQuantity,
              QUANTITY_TEXT_SEPARATOR,
            );
          }
          itemToAdd.q--;
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        const newItem = createCartItemElement(
          itemToAdd,
          1,
          {
            wrapper: CLASS_PRODUCT_WRAPPER,
            quantity: CLASS_BTN_QUANTITY,
            remove: CLASS_BTN_REMOVE,
          },
          QUANTITY_TEXT_SEPARATOR,
        );
        cartDisplay.appendChild(newItem);
        itemToAdd.q--;
      }

      calculateCart();
      state.lastSelectedProductId = selectedProductId;
    }
  });
};
