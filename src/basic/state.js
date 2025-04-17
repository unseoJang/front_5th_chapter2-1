// 전역 상태 관리
export const state = {
  prodList: [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 },
  ], // 상품 목록
  select: null,
  addCartButton: null,
  cartDisplay: null,
  totalDisplay: null,
  stockStatus: null,
  lastSelectedProductId: null, // 마지막 선택된 상품 ID
  bonusPoints: 0, // 보너스 포인트
  finalPaymentAmount: 0, // 최종 결제 금액
  cartAllItemCount: 0, // 장바구니 전체 상품 갯수
};
