import React from 'react';
import { CLASS_BTN_QUANTITY, CLASS_BTN_REMOVE } from '../constants/classNAme';
import type { CartItems } from '../types/CartItems';

export const CartItem: React.FC<CartItems> = ({
  cartItems,
  onChangeQuantity,
  onRemove,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <span>
        {cartItems.name} - {cartItems.val}원 x {cartItems.q}
      </span>
      <div>
        <button
          className={CLASS_BTN_QUANTITY}
          onClick={() => onChangeQuantity(cartItems.id, -1)}
        >
          -
        </button>
        <button
          className={CLASS_BTN_QUANTITY}
          onClick={() => onChangeQuantity(cartItems.id, 1)}
        >
          +
        </button>
        <button
          className={CLASS_BTN_REMOVE}
          onClick={() => onRemove(cartItems.id)}
        >
          삭제
        </button>
      </div>
    </div>
  );
};
