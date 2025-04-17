import React, { useMemo } from 'react';
import {
  BULE_PURCHASE_PRODUCT_THRESHOLD,
  BULK_PURCHASE_THRESHOLD,
  EXTRA_DISCOUT_PERCENT,
  PRODUCT_DISCOUT_MAP,
  TUESDAY_DISCOUNT_AMOUNT_PERCENT,
} from '../constants/discount';
import {
  getDiscountPrice,
  applyBestBulkDiscount,
  isTuesday,
} from '../utils/utils';
import { ICartItemType } from '../types/CartItems';

export const CartSummary: React.FC<ICartItemType> = ({ cartItems }) => {
  const { finalPrice, discountRate, bonusPoints } = useMemo(() => {
    let cartAllItemPrice = 0;
    let finalPaymentAmount = 0;
    let totalQuantity = 0;

    cartItems.forEach((item) => {
      const quantity = item.q;
      const price = item.val * quantity;
      const discount =
        quantity >= BULE_PURCHASE_PRODUCT_THRESHOLD
          ? PRODUCT_DISCOUT_MAP[item.id] || 0
          : 0;

      cartAllItemPrice += price;
      finalPaymentAmount += getDiscountPrice(price, discount);
      totalQuantity += quantity;
    });

    let discountPercent = 0;

    if (totalQuantity >= BULK_PURCHASE_THRESHOLD) {
      const { price, rate } = applyBestBulkDiscount(
        cartAllItemPrice,
        finalPaymentAmount,
        BULE_PURCHASE_PRODUCT_THRESHOLD,
        EXTRA_DISCOUT_PERCENT,
      );
      finalPaymentAmount = price;
      discountPercent = rate;
    } else if (cartAllItemPrice > 0) {
      discountPercent =
        (cartAllItemPrice - finalPaymentAmount) / cartAllItemPrice;
    }

    // 화요일 할인 적용
    if (isTuesday()) {
      finalPaymentAmount *= 1 - TUESDAY_DISCOUNT_AMOUNT_PERCENT;
      discountPercent = Math.max(
        discountPercent,
        TUESDAY_DISCOUNT_AMOUNT_PERCENT,
      );
    }

    const bonusPoints = Math.floor(finalPaymentAmount / 1000);

    return {
      totalPrice: cartAllItemPrice,
      finalPrice: Math.round(finalPaymentAmount),
      discountRate: discountPercent,
      bonusPoints,
    };
  }, [cartItems]);

  return (
    <div id="cart-total" className="text-xl font-bold my-4">
      총액: {finalPrice.toLocaleString()}원
      {discountRate > 0 && (
        <span className="text-green-500 ml-2">
          ({(discountRate * 100).toFixed(1)}% 할인 적용)
        </span>
      )}
      <span id="loyalty-points" className="text-blue-500 ml-2">
        (포인트: {bonusPoints})
      </span>
    </div>
  );
};
