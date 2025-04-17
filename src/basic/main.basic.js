// @ts-nocheck

import {
  SUGGESTION_PRODUCT_INTERVAL,
  LUCKY_EVENT_SALE_INTERVAL,
} from './constants/discount.js';

import { getProductById, updateProductOption, calculateCart } from './utils.js';

import { state } from './state.js';
import {
  handleAddCartClick,
  handleCartItemClick,
} from './handlers/cartHandlers.js';

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

export const dom = {
  select: null,
  addCartButton: null,
  cartDisplay: null,
  totalDisplay: null,
  stockStatus: null,
};

export const cartDisplay = (dom.cartDisplay = document.createElement('div'));
export const totalDisplay = (dom.totalDisplay = document.createElement('div'));
export const select = (dom.select = document.createElement('select'));
export const addCartButton = (dom.addCartButton =
  document.createElement('button'));
export const stockStatus = (dom.stockStatus = document.createElement('div'));

// main 함수 - DOM 구성 및 이벤트 설정
const main = () => {
  // let select, addCartButton, cartDisplay, totalDisplay, stockStatus; // DOM 요소들

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
  }, Math.random() * 10);

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
  }, Math.random() * 20);

  // Initial rendering
  addCartButton.addEventListener('click', () => handleAddCartClick());
  cartDisplay.addEventListener('click', (event) => handleCartItemClick(event));

  updateProductOption(); // ✅ 초기 옵션 렌더링
  calculateCart(); // ✅ 초기 총액 렌더링
};

main();
