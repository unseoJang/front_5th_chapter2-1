import { useEffect } from 'react';
import { LUCKY_EVENT_SALE_INTERVAL } from '../constants/discount';
import { CartItemType } from '../types/CartItems';

export const useLuckySaleEffect = (
  prodList: CartItemType[],
  setProdList: React.Dispatch<React.SetStateAction<CartItemType[]>>,
) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        const luckyIndex = Math.floor(Math.random() * prodList.length);
        const luckyItem = prodList[luckyIndex];
        if (Math.random() < 0.3 && luckyItem.q > 0) {
          alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
          setProdList((prev) =>
            prev.map((item, index) =>
              index === luckyIndex
                ? { ...item, val: Math.round(item.val * 0.8) }
                : item,
            ),
          );
        }
      }, LUCKY_EVENT_SALE_INTERVAL);

      return () => clearInterval(interval);
    }, Math.random() * 10000);

    return () => clearTimeout(timeout);
  }, [prodList, setProdList]);
};
