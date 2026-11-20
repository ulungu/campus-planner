import React from 'react';
import ChipGroup from '../ui/ChipGroup';
import { SORT_LABELS, TaskSort } from '../../types/task';

const OPTIONS: readonly TaskSort[] = ['created', 'dueDate', 'priority'];

interface SortSelectorProps {
  value: TaskSort;
  onChange: (value: TaskSort) => void;
}

// Выбор порядка списка (собственная функция ЛР №8)
export default function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <ChipGroup
      caption="Сортировка:"
      options={OPTIONS}
      labels={SORT_LABELS}
      value={value}
      onChange={onChange}
    />
  );
}
