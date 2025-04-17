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

interface CartItems {
  cartItems: CartItem;
  onChangeQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
}

interface CartItem {
  id: string;
  name: string;
  val: number;
  q: number;
}

interface ProductSelectProps {
  prodList: {
    id: string;
    name: string;
    val: number;
    q: number;
  }[];
  selectedId: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export { ICartItemType, CartItemType, CartItems, CartItem, ProductSelectProps };
