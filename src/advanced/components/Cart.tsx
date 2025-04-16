import React from 'react';
import { useState } from 'react';
import { CartItem } from './CartItem';

export const Cart = () => {
  const [prodList, setProdList] = useState(() => [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 },
  ]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-4">장바구니</h1>

      <div id="cart-items">
        <CartItem id={''} name={''} val={0} quantity={0} on={undefined} />
      </div>

      <div id="cart-total" className="text-xl font-bold my-4">
        총액: 0원
        <span className="text-green-500 ml-2">(10.0% 할인 적용)</span>
        <span id="loyalty-points" className="text-blue-500 ml-2">
          (포인트: 126)
        </span>
      </div>

      <div className="flex items-center mt-4">
        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
          추가
        </button>
      </div>
    </div>
  );
};
