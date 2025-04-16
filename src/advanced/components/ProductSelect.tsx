// ProductSelect.tsx
import React from 'react';

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

export const ProductSelect = ({
  prodList,
  selectedId,
  onChange,
}: ProductSelectProps) => {
  return (
    <select
      id="product-select"
      className="border rounded p-2 mr-2"
      value={selectedId}
      onChange={onChange}
    >
      {prodList.map((item) => (
        <option key={item.id} value={item.id} disabled={item.q === 0}>
          {item.name} - {item.val}원
        </option>
      ))}
    </select>
  );
};
