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
 */

// 상품 할인율 상수
const BULK_PURCHASE_THRESHOLD = 30;
const BULE_PURCHASE_PRODUCT_THRESHOLD = 10;
const EXTRA_DISCOUT_PERCENT = 0.25;
const SUGGESTION_PRODUCT_INTERVAL = 60000;
const LUCKY_EVENT_SALE_INTERVAL = 30000;
const TUESDAY_DISCOUNT_AMOUNT_PERCENT = 0.1;

// 고정된 클래스 명
const CLASS_PRODUCT_WRAPPER = 'flex justify-between items-center mb-2';
const CLASS_BTN_QUANTITY =
  'quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1';
const CLASS_BTN_REMOVE = 'remove-item bg-red-500 text-white px-2 py-1 rounded';
const CLASS_DISCOUNT_TAG = 'text-green-500 ml-2';
const CLASS_POINTS_TAG = 'text-blue-500 ml-2';

// 특정 문자열 키
const DATASET_KEY_PRODUCT_ID = 'productId';
const DATASET_KEY_CHANGE = 'change';

// 정규화된 텍스ㅡ 파싱 기준 문자
const QUANTITY_TEXT_SEPARATOR = 'x ';

// 상품 할인율 상수
const PRODUCT_DISCOUT_MAP = {
  p1: 0.1,
  p2: 0.15,
  p3: 0.2,
  p4: 0.05,
  p5: 0.25,
};

/**
 * 할인 비율 적용
 * @param {*} price
 * @param {*} percent
 * @returns {number}
 */
const getDiscountPrice = (price, percent) => price * (1 - percent);

/**
 * 화요일인지 여부
 * @returns {boolean}
 */
const isTuesday = () => {
  return new Date().getDay() === 2;
};

/**
 * 상품 목록에서 ID로 상품 찾기
 * @param {*} prodList
 * @param {*} id
 * @returns {object}
 */
const getProductById = (prodList, id) => {
  return prodList.find((product) => product.id === id);
};

/**
 * 텍스트에서 수량 파싱 (예: 'x 3' → 3)
 * @param {*} text
 * @param {*} separator
 * @returns
 */
const getQuantityFromText = (text, separator = QUANTITY_TEXT_SEPARATOR) => {
  return parseInt(text.split(separator)[1], 10);
};

/**
 * 텍스트로부터 수량 + 변화량 계산 (예: 'x 3' + 1 -> 4)
 * @param {*} text
 * @param {*} change
 * @param {*} separator
 * @returns {number}
 */
const getUpdatedQuantity = (
  text,
  change,
  separator = QUANTITY_TEXT_SEPARATOR,
) => {
  const currentQuantity = getQuantityFromText(text, separator);
  return currentQuantity + change;
};

/**
 * 재고 부족 여부 확인
 * @param {*} stock // 재고 수량
 * @param {*} requested // 요청 수량
 * @returns {boolean}
 */
const hasInsufficientStock = (stock, requested) => requested > stock;

/**
 * 상품 표시 텍스트 포맷팅
 * @param {*} name
 * @param {*} price
 * @param {*} quantity
 * @param {*} separator
 * @returns {string}
 */
const formatProductDisplayText = (
  name,
  price,
  quantity,
  separator = QUANTITY_TEXT_SEPARATOR,
) => {
  return `${name} - ${price}원 ${separator}${quantity}`;
};

// main 함수 - DOM 구성 및 이벤트 설정
const main = () => {
  let prodList, select, addCartButton, cartDisplay, totalDisplay, stockStatus;
  let lastSelectedProductId,
    bonusPoints = 0,
    finalPaymentAmount = 0,
    cartAllItemCount = 0;

  // 상품 데이터
  prodList = [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 },
  ];

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
    finalPaymentAmount = 0; // 최종 결제 금액
    cartAllItemCount = 0; // 카트 전체 상품 갯수
    const cartItems = cartDisplay.children;
    let cartAllItemPrice = 0; // 카트 전체 상품 가격

    // 장바구니에 담긴 상품들
    for (let i = 0; i < cartItems.length; i++) {
      // 상품 아이템
      (() => {
        let currentProduct;
        // 상품 ID로 상품 찾기
        const productId = cartItems[i].id;
        currentProduct = getProductById(prodList, productId); // 상품 찾기
        // 상품 수량
        const quantity = getQuantityFromText(
          cartItems[i].querySelector('span').textContent,
          QUANTITY_TEXT_SEPARATOR,
        );

        const currentProductPrice = currentProduct.val * quantity;
        let discount = 0;
        cartAllItemCount += quantity;
        cartAllItemPrice += currentProductPrice;

        if (quantity >= BULE_PURCHASE_PRODUCT_THRESHOLD) {
          discount = PRODUCT_DISCOUT_MAP[currentProduct.id] || 0; // 상품 할인율
        }

        finalPaymentAmount += getDiscountPrice(currentProductPrice, discount); // 할인율 적용
      })();
    }

    let discountPercent = 0; // 할인율

    // 전체 수량이 30개 이상일때 적용할 수 있는 대량 구매 할인
    if (cartAllItemCount >= BULK_PURCHASE_THRESHOLD) {
      const extraDiscountAmount = finalPaymentAmount * EXTRA_DISCOUT_PERCENT; // 추가할인액
      const itemDiscount = cartAllItemPrice - finalPaymentAmount; // 상품 할인액

      // 추가 할인액이 상품 할인액보다 클 경우
      if (extraDiscountAmount > itemDiscount) {
        // 추가 할인액을 적용
        finalPaymentAmount = getDiscountPrice(
          cartAllItemPrice,
          EXTRA_DISCOUT_PERCENT,
        );
        discountPercent = EXTRA_DISCOUT_PERCENT;
      } else {
        discountPercent =
          (cartAllItemPrice - finalPaymentAmount) / cartAllItemPrice;
      }
    } else {
      discountPercent =
        (cartAllItemPrice - finalPaymentAmount) / cartAllItemPrice;
    }

    if (isTuesday()) {
      finalPaymentAmount *= 1 - TUESDAY_DISCOUNT_AMOUNT_PERCENT;
      discountPercent = Math.max(
        discountPercent,
        TUESDAY_DISCOUNT_AMOUNT_PERCENT,
      );
    }
    totalDisplay.textContent = '총액: ' + Math.round(finalPaymentAmount) + '원';

    if (discountPercent > 0) {
      const span = document.createElement('span');
      span.className = CLASS_DISCOUNT_TAG;
      span.textContent =
        '(' + (discountPercent * 100).toFixed(1) + '% 할인 적용)';
      totalDisplay.appendChild(span);
    }
    updateStockStatus();
    renderBonusPoints();
  }

  /**
   * 포인트 랜더링
   */
  const renderBonusPoints = () => {
    bonusPoints = Math.floor(finalPaymentAmount / 1000);
    let pointsTag = document.getElementById('loyalty-points');
    if (!pointsTag) {
      pointsTag = document.createElement('span');
      pointsTag.id = 'loyalty-points';
      pointsTag.className = CLASS_POINTS_TAG;
      totalDisplay.appendChild(pointsTag);
    }
    pointsTag.textContent = '(포인트: ' + bonusPoints + ')';
  };

  /**
   * 재고 정보 업데이트
   */
  function updateStockStatus() {
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
  }

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
      if (lastSelectedProductId) {
        const suggestedProduct = getProductById(
          prodList,
          lastSelectedProductId,
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
  /**
   * 장바구니 추가 버튼
   */
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
      lastSelectedProductId = selectedProductId;
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
          updatedQuantity > 0 &&
          updatedQuantity <=
            selectedProduct.q +
              getQuantityFromText(
                itemElement.querySelector('span').textContent,
                QUANTITY_TEXT_SEPARATOR,
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
