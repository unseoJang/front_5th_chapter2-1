import React, { useMemo, useEffect } from 'react';
import { CartItemType } from './Cart';

interface Props {
  cartItems: CartItemType[];
}

export const CartSummary: React.FC<Props> = ({ cartItems }) => {
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.val * item.q,
    0,
  );

  return (
    <div id="cart-total" className="text-xl font-bold my-4">
      총액: {totalPrice}원
      <span className="text-green-500 ml-2">(10.0% 할인 적용)</span>
      <span id="loyalty-points" className="text-blue-500 ml-2">
        (포인트: 126)
      </span>
    </div>
  );
};
