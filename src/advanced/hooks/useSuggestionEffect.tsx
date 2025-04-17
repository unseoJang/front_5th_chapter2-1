import { useEffect } from 'react';
import { SUGGESTION_PRODUCT_INTERVAL } from '../constants/discount';
import { CartItemType } from '../types/CartItems';

export const useSuggestionEffect = (
  prodList: CartItemType[],
  setProdList: React.Dispatch<React.SetStateAction<CartItemType[]>>,
  lastSelectedProductId?: string,
) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (!lastSelectedProductId) return;

        const suggestedProduct = prodList.find(
          (item) => item.id === lastSelectedProductId,
        );

        if (suggestedProduct) {
          alert(
            `${suggestedProduct.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`,
          );
          setProdList((prev) =>
            prev.map((item) =>
              item.id === suggestedProduct.id
                ? { ...item, val: Math.round(item.val * 0.95) }
                : item,
            ),
          );
        }
      }, SUGGESTION_PRODUCT_INTERVAL);

      return () => clearInterval(interval);
    }, Math.random() * 20000);

    return () => clearTimeout(timeout);
  }, [prodList, setProdList, lastSelectedProductId]);
};
