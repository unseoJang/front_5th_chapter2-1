import React, { useMemo } from 'react';
export const CartSummary = ({ cartItems }) => {
  return (
    <div id="cart-total" className="text-xl font-bold my-4">
      총액: 0원
      <span className="text-green-500 ml-2">(10.0% 할인 적용)</span>
      <span id="loyalty-points" className="text-blue-500 ml-2">
        (포인트: 126)
      </span>
    </div>
  );
};
