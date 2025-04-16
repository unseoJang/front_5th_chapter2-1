import React from 'react';
import { CLASS_BTN_QUANTITY, CLASS_BTN_REMOVE } from '../constants/classNAme';

interface CartItemProps {
  id: string;
  name: string;
  val: number;
  quantity: number;
  on;
}

export const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <span>상품1 - 10000원 x 1</span>
      <div>
        <button className={CLASS_BTN_QUANTITY}> - </button>
        <button className={CLASS_BTN_QUANTITY}> + </button>
        <button className={CLASS_BTN_REMOVE}>삭제</button>
      </div>
    </div>
  );
};
