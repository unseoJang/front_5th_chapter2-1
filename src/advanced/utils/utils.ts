import { CartItemType } from '../components/Cart';

export function increaseCartItemQuantity(
  items: CartItemType[],
  targetId: string,
): CartItemType[] {
  return items.map((item) =>
    item.id === targetId ? { ...item, q: item.q + 1 } : item,
  );
}

export function decreaseCartItemQuantity(
  items: CartItemType[],
  targetId: string,
): CartItemType[] {
  return items.map((item) =>
    item.id === targetId ? { ...item, q: item.q - 1 } : item,
  );
}

export const updateProductStock = (
  productList: CartItemType[],
  id: string,
  change: number, // 음수면 감소, 양수면 증가
): CartItemType[] => {
  return productList.map((item) =>
    item.id === id ? { ...item, q: item.q + change } : item,
  );
};
