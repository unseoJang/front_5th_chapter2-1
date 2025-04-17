// types.ts (또는 CartItem.tsx 위에)
interface CartItemType {
  id: string;
  name: string;
  val: number;
  q: number;
}

interface ICartItemType {
  cartItems: CartItemType[];
}

export { ICartItemType, CartItemType };
