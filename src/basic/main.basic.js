import {
  BULK_PURCHASE_THRESHOLD,
  BULE_PURCHASE_PRODUCT_THRESHOLD,
  EXTRA_DISCOUT_PERCENT,
  SUGGESTION_PRODUCT_INTERVAL,
  LUCKY_EVENT_SALE_INTERVAL,
  TUESDAY_DISCOUNT_AMOUNT_PERCENT,
  PRODUCT_DISCOUT_MAP,
} from './constants/discount.js';

import {
  CLASS_PRODUCT_WRAPPER,
  CLASS_BTN_QUANTITY,
  CLASS_BTN_REMOVE,
  CLASS_DISCOUNT_TAG,
  CLASS_POINTS_TAG,
} from './constants/className.js';

import {
  DATASET_KEY_PRODUCT_ID,
  DATASET_KEY_CHANGE,
  QUANTITY_TEXT_SEPARATOR,
} from './constants/datasetKeys.js';

import {
  isTuesday,
  getDiscountPrice,
  getProductById,
  getQuantityFromText,
  getUpdatedQuantity,
  formatProductDisplayText,
  applyBestBulkDiscount,
  isValidUpdatedQuantity,
} from './utils.js';

import { state } from './state.js';

/**
 * 진행 순서
 *  1. 개행을 통한 코드 분리 및 주석 처리
 *  2. 변수 및 함수 이름 수정
 *  3. var -> const or let 으로 변경
 *  4. 상수 만들기
 *  5. 유틸 함수 최대한 '순수 함수' 형태로 분리
 *  6. 헬퍼함수 분리
 *  7. 이벤트 리스너 `main()` 안으로 넣기
 *  8. 리액트로 변경이 쉽게 화살표 함수로 변경
 *  9. 타입스크립트 변경 용의를 위한 가드 추가
 * 10. 명령형 -> 선언형???
 * 11. 전역변수 순차적 정리
 */

// main 함수 - DOM 구성 및 이벤트 설정
const main = () => {
  let select, addCartButton, cartDisplay, totalDisplay, stockStatus; // DOM 요소들

  // 상품 데이터
  const prodList = (state.prodList = [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 },
  ]);

  // Create main container
  const root = document.getElementById('app');
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const title = document.createElement('h1');

  cartDisplay = document.createElement('div');
  totalDisplay = document.createElement('div');
  select = document.createElement('select');
  addCartButton = document.createElement('button');
  stockStatus = document.createElement('div');

  // 클래스 및 ID 설정
  cartDisplay.id = 'cart-items';
  totalDisplay.id = 'cart-total';
  select.id = 'product-select';
  addCartButton.id = 'add-to-cart';
  stockStatus.id = 'stock-status';

  container.className = 'bg-gray-100 p-8';
  wrapper.className =
    'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  title.className = 'text-2xl font-bold mb-4';
  totalDisplay.className = 'text-xl font-bold my-4';
  select.className = 'border rounded p-2 mr-2';
  addCartButton.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  stockStatus.className = 'text-sm text-gray-500 mt-2';

  // 텍스트 내용 삽입
  title.textContent = '장바구니';
  addCartButton.textContent = '추가';

  // append elements
  wrapper.appendChild(title);
  wrapper.appendChild(cartDisplay);
  wrapper.appendChild(totalDisplay);
  wrapper.appendChild(select);
  wrapper.appendChild(addCartButton);
  wrapper.appendChild(stockStatus);
  container.appendChild(wrapper);
  root
    ? root.appendChild(container)
    : console.error("Element with ID 'app' not found in the DOM.");

  // event listeners

  /**
   * 상품 선택 옵션 업데이트
   */
  function updateProductOption() {
    select.innerHTML = '';

    prodList.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name + ' - ' + item.val + '원';

      if (item.q === 0) option.disabled = true;

      select.appendChild(option);
    });
  }

  /**
   * 장바구니 계산 함수
   */
  function calculateCart() {
    state.finalPaymentAmount = 0; // 최종 결제 금액
    state.cartAllItemCount = 0; // 카트 전체 상품 갯수
    const cartItems = cartDisplay.children; // 장바구니에 담긴 상품들
    let cartAllItemPrice = 0; // 카트 전체 상품 가격

    // 장바구니에 담긴 상품들
    for (const cartItem of cartItems) {
      const productId = cartItem.id;
      const currentProduct = getProductById(prodList, productId);
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
      state.finalPaymentAmount += getDiscountPrice(
        productPrice,
        productDiscount,
      );
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

  /**
   * 포인트 랜더링
   */
  const renderBonusPoints = () => {
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
  const updateStockStatus = () => {
    let infoMsg = '';
    prodList.forEach((item) => {
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

  // set up event listeners

  /**
   * 번개세일 타이머 설정
   */
  setTimeout(() => {
    setInterval(() => {
      const luckyItem = prodList[Math.floor(Math.random() * prodList.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        updateProductOption();
      }
    }, LUCKY_EVENT_SALE_INTERVAL);
  }, Math.random() * 10000);

  // Suggestion for other products

  /**
   * 추천상품 타이머 설정
   */
  setTimeout(() => {
    setInterval(() => {
      if (state.lastSelectedProductId) {
        const suggestedProduct = getProductById(
          prodList,
          state.lastSelectedProductId,
        );
        if (suggestedProduct) {
          alert(
            suggestedProduct.name +
              '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!',
          );
          suggestedProduct.val = Math.round(suggestedProduct.val * 0.95);
          updateProductOption();
        }
      }
    }, SUGGESTION_PRODUCT_INTERVAL);
  }, Math.random() * 20000);

  // Initial rendering
  addCartButton.addEventListener('click', () => {
    const selectedProductId = select.value; // 선택된 상품 ID
    const itemToAdd = getProductById(prodList, selectedProductId); // 선택된 상품

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
  });

  /**
   * 장바구니 아이템 수량 변경 및 삭제 이벤트 핸들러 (이벤트 위임)
   */
  cartDisplay.addEventListener('click', (event) => {
    const target = event.target;

    if (
      (target instanceof HTMLElement &&
        target.classList.contains('quantity-change')) ||
      (target instanceof HTMLElement &&
        target.classList.contains('remove-item'))
    ) {
      const targetProductId = target.dataset[DATASET_KEY_PRODUCT_ID]; // target
      const itemElement = targetProductId
        ? document.getElementById(targetProductId)
        : null;
      const selectedProduct = getProductById(prodList, targetProductId); // 상품 찾기

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
        const selectedQuantity = parseInt(
          // 남은 수량
          itemElement
            .querySelector('span')
            .textContent.split(QUANTITY_TEXT_SEPARATOR)[1],
        );
        selectedProduct.q += selectedQuantity;
        itemElement.remove();
      }
      calculateCart();
    }
  });

  updateProductOption(); // ✅ 초기 옵션 렌더링
  calculateCart(); // ✅ 초기 총액 렌더링
};

main();
