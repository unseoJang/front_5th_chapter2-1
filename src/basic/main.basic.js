/**
 * 진행 순서
 *  1. 개행을 통한 코드 분리
 *  2. 변수 및 함수 이름 수정
 *  3. var -> const or let 으로 변경
 *  4. 상수 만들기
 *  5. 유틸 함수 최대한 '순수 함수' 형태로 분리
 *  6. 이벤트 리스너 `main()` 안으로 넣기
 */

const prodList = [
  { id: 'p1', name: '상품1', val: 10000, q: 50 },
  { id: 'p2', name: '상품2', val: 20000, q: 30 },
  { id: 'p3', name: '상품3', val: 30000, q: 20 },
  { id: 'p4', name: '상품4', val: 15000, q: 0 },
  { id: 'p5', name: '상품5', val: 25000, q: 10 },
];

function main() {
  let prodList, select, addBtn, cartDisplay, totalDisplay, stockInfo;
  let lastSel,
    bonusPts = 0,
    totalAmt = 0,
    itemCnt = 0;

  prodList = [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 },
  ];

  // Create main container
  const root = document.getElementById('app');
  const cont = document.createElement('div');
  const wrapper = document.createElement('div');
  const title = document.createElement('h1');

  cartDisplay = document.createElement('div');
  totalDisplay = document.createElement('div');
  select = document.createElement('select');
  addBtn = document.createElement('button');
  stockInfo = document.createElement('div');

  // 클래스 및 ID 설정
  cartDisplay.id = 'cart-items';
  totalDisplay.id = 'cart-total';
  select.id = 'product-select';
  addBtn.id = 'add-to-cart';
  stockInfo.id = 'stock-status';

  cont.className = 'bg-gray-100 p-8';
  wrapper.className =
    'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  title.className = 'text-2xl font-bold mb-4';
  totalDisplay.className = 'text-xl font-bold my-4';
  select.className = 'border rounded p-2 mr-2';
  addBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  stockInfo.className = 'text-sm text-gray-500 mt-2';

  // 텍스트 내용 삽입
  title.textContent = '장바구니';
  addBtn.textContent = '추가';

  // append elements
  wrapper.appendChild(title);
  wrapper.appendChild(cartDisplay);
  wrapper.appendChild(totalDisplay);
  wrapper.appendChild(select);
  wrapper.appendChild(addBtn);
  wrapper.appendChild(stockInfo);
  cont.appendChild(wrapper);
  root.appendChild(cont);

  // event listeners
  function updateSelOpts() {
    select.innerHTML = '';
    prodList.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name + ' - ' + item.val + '원';
      if (item.q === 0) opt.disabled = true;
      select.appendChild(opt);
    });
  }

  function calcCart() {
    totalAmt = 0;
    itemCnt = 0;
    var cartItems = cartDisplay.children;
    var subTot = 0;
    for (var i = 0; i < cartItems.length; i++) {
      (function () {
        var curItem;
        for (var j = 0; j < prodList.length; j++) {
          if (prodList[j].id === cartItems[i].id) {
            curItem = prodList[j];
            break;
          }
        }
        var q = parseInt(
          cartItems[i].querySelector('span').textContent.split('x ')[1],
        );
        var itemTot = curItem.val * q;
        var disc = 0;
        itemCnt += q;
        subTot += itemTot;
        if (q >= 10) {
          if (curItem.id === 'p1') disc = 0.1;
          else if (curItem.id === 'p2') disc = 0.15;
          else if (curItem.id === 'p3') disc = 0.2;
          else if (curItem.id === 'p4') disc = 0.05;
          else if (curItem.id === 'p5') disc = 0.25;
        }
        totalAmt += itemTot * (1 - disc);
      })();
    }
    let discRate = 0;
    if (itemCnt >= 30) {
      var bulkDisc = totalAmt * 0.25;
      var itemDisc = subTot - totalAmt;
      if (bulkDisc > itemDisc) {
        totalAmt = subTot * (1 - 0.25);
        discRate = 0.25;
      } else {
        discRate = (subTot - totalAmt) / subTot;
      }
    } else {
      discRate = (subTot - totalAmt) / subTot;
    }
    if (new Date().getDay() === 2) {
      totalAmt *= 1 - 0.1;
      discRate = Math.max(discRate, 0.1);
    }
    totalDisplay.textContent = '총액: ' + Math.round(totalAmt) + '원';
    if (discRate > 0) {
      var span = document.createElement('span');
      span.className = 'text-green-500 ml-2';
      span.textContent = '(' + (discRate * 100).toFixed(1) + '% 할인 적용)';
      totalDisplay.appendChild(span);
    }
    updateStockInfo();
    renderBonusPts();
  }

  /**
   * 포인트 랜더링
   */
  const renderBonusPts = () => {
    bonusPts = Math.floor(totalAmt / 1000);
    var ptsTag = document.getElementById('loyalty-points');
    if (!ptsTag) {
      ptsTag = document.createElement('span');
      ptsTag.id = 'loyalty-points';
      ptsTag.className = 'text-blue-500 ml-2';
      totalDisplay.appendChild(ptsTag);
    }
    ptsTag.textContent = '(포인트: ' + bonusPts + ')';
  };

  /**
   * 재고 정보 업데이트
   */
  function updateStockInfo() {
    var infoMsg = '';
    prodList.forEach(function (item) {
      if (item.q < 5) {
        infoMsg +=
          item.name +
          ': ' +
          (item.q > 0 ? '재고 부족 (' + item.q + '개 남음)' : '품절') +
          '\n';
      }
    });
    stockInfo.textContent = infoMsg;
  }

  // set up event listeners
  setTimeout(function () {
    setInterval(function () {
      var luckyItem = prodList[Math.floor(Math.random() * prodList.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        updateSelOpts();
      }
    }, 30000);
  }, Math.random() * 10000);

  // Suggestion for other products
  setTimeout(function () {
    setInterval(function () {
      if (lastSel) {
        var suggest = prodList.find(function (item) {
          return item.id !== lastSel && item.q > 0;
        });
        if (suggest) {
          alert(
            suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!',
          );
          suggest.val = Math.round(suggest.val * 0.95);
          updateSelOpts();
        }
      }
    }, 60000);
  }, Math.random() * 20000);

  // Initial rendering
  addBtn.addEventListener('click', function () {
    var selItem = select.value;
    var itemToAdd = prodList.find(function (p) {
      return p.id === selItem;
    });
    if (itemToAdd && itemToAdd.q > 0) {
      var item = document.getElementById(itemToAdd.id);
      if (item) {
        var newQty =
          parseInt(item.querySelector('span').textContent.split('x ')[1]) + 1;
        if (newQty <= itemToAdd.q) {
          item.querySelector('span').textContent =
            itemToAdd.name + ' - ' + itemToAdd.val + '원 x ' + newQty;
          itemToAdd.q--;
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        var newItem = document.createElement('div');
        newItem.id = itemToAdd.id;
        newItem.className = 'flex justify-between items-center mb-2';
        newItem.innerHTML =
          '<span>' +
          itemToAdd.name +
          ' - ' +
          itemToAdd.val +
          '원 x 1</span><div>' +
          '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
          itemToAdd.id +
          '" data-change="-1">-</button>' +
          '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
          itemToAdd.id +
          '" data-change="1">+</button>' +
          '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
          itemToAdd.id +
          '">삭제</button></div>';
        cartDisplay.appendChild(newItem);
        itemToAdd.q--;
      }
      calcCart();
      lastSel = selItem;
    }
  });

  cartDisplay.addEventListener('click', function (event) {
    var tgt = event.target;
    if (
      tgt.classList.contains('quantity-change') ||
      tgt.classList.contains('remove-item')
    ) {
      var prodId = tgt.dataset.productId;
      var itemElem = document.getElementById(prodId);
      var prod = prodList.find(function (p) {
        return p.id === prodId;
      });
      if (tgt.classList.contains('quantity-change')) {
        var qtyChange = parseInt(tgt.dataset.change);
        var newQty =
          parseInt(itemElem.querySelector('span').textContent.split('x ')[1]) +
          qtyChange;
        if (
          newQty > 0 &&
          newQty <=
            prod.q +
              parseInt(
                itemElem.querySelector('span').textContent.split('x ')[1],
              )
        ) {
          itemElem.querySelector('span').textContent =
            itemElem.querySelector('span').textContent.split('x ')[0] +
            'x ' +
            newQty;
          prod.q -= qtyChange;
        } else if (newQty <= 0) {
          itemElem.remove();
          prod.q -= qtyChange;
        } else {
          alert('재고가 부족합니다.');
        }
      } else if (tgt.classList.contains('remove-item')) {
        var remQty = parseInt(
          itemElem.querySelector('span').textContent.split('x ')[1],
        );
        prod.q += remQty;
        itemElem.remove();
      }
      calcCart();
    }
  });

  updateSelOpts(); // ✅ 초기 옵션 렌더링
  calcCart(); // ✅ 초기 총액 렌더링
}

main();
