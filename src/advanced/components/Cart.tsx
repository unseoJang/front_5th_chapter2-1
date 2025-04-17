import React, { useState } from 'react';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { ProductSelect } from './ProductSelect';
import {
  decreaseCartItemQuantity,
  increaseCartItemQuantity,
  updateProductStock,
} from '../utils/utils';
import { useLuckySaleEffect } from '../hooks/useLuckySaleEffect';
import { useSuggestionEffect } from '../hooks/useSuggestionEffect';
import type { CartItemType } from '../types/CartItems';

export const Cart = () => {
  const [prodList, setProdList] = useState(() => [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 },
  ]);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');

  useLuckySaleEffect(prodList, setProdList);
  useSuggestionEffect(prodList, setProdList, selectedProductId);

  const handleAddToCart = () => {
    const product = prodList.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (product.q <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    // 이미 장바구니에 있는 상품인지 확인
    const existingItem = cartItems.find(
      (item) => item.id === selectedProductId,
    );

    if (existingItem) {
      setCartItems((prev) => increaseCartItemQuantity(prev, selectedProductId));
      setProdList((prev) => decreaseCartItemQuantity(prev, selectedProductId));
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          val: product.val,
          q: 1,
        },
      ]);
    }

    // prodList의 재고 감소
    setProdList((prev) => decreaseCartItemQuantity(prev, selectedProductId));
  };

  const handleQuanityChange = (id: string, change: number) => {
    // 현재 상품의 재고 확인
    const product = prodList.find((p) => p.id === id);
    const cartItem = cartItems.find((item) => item.id === id);

    if (!product) return;

    // ✅ 수량 증가 시: 재고 초과 방지
    if (change > 0 && product.q <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    // ✅ 수량 감소 시: 최소 1개 이상 있어야 함 (사실 아래 filter로 제거되지만, 명확히 제어할 수 있음)
    if (change < 0 && (!cartItem || cartItem.q <= 0)) {
      return;
    }

    // 장바구니에서 상품 수량 변경
    setCartItems(
      (prev) =>
        prev
          .map((item) =>
            item.id === id ? { ...item, q: item.q + change } : item,
          )
          .filter((item) => item.q > 0), // 수량이 0 이하인 상품 제거
    );

    // prodList의 재고 변경
    setProdList((prev) => updateProductStock(prev, id, -change));
  };

  const handleRemoveToCart = (id: string) => {
    // prodList의 기존 재고 복구
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      setProdList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, q: item.q + itemToRemove.q } : item,
        ),
      );
    }
    // 장바구니에서 상품 수량 변경
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, q: item.q - itemToRemove!.q } : item,
      ),
    );

    // 장바구니에서 상품 제거
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    console.log(prodList);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-4">장바구니</h1>

      <div id="cart-items">
        {cartItems.map((item, key) => {
          return (
            <CartItem
              key={key}
              cartItems={item}
              onChangeQuantity={(id, change) => handleQuanityChange(id, change)}
              onRemove={(id) => handleRemoveToCart(id)}
            />
          );
        })}
      </div>

      <CartSummary cartItems={cartItems} />

      <ProductSelect
        prodList={prodList}
        selectedId={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)} // ✅ 여기!
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => handleAddToCart()}
      >
        추가
      </button>

      {prodList.map((item, key) =>
        item.q <= 5 ? (
          <div
            id="stock-status"
            key={item.id}
            className="text-sm text-gray-500 mt-2"
          >
            {item.q === 0
              ? `${item.name}: 품절`
              : `${item.name}: 재고 부족 (${item.q}개 남음)`}
          </div>
        ) : null,
      )}
    </div>
  );
};
