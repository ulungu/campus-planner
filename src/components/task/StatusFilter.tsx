import React from 'react';
import ChipGroup from '../ui/ChipGroup';
import { STATUS_FILTER_LABELS, TaskStatusFilter } from '../../types/task';

const OPTIONS: readonly TaskStatusFilter[] = ['all', 'active', 'completed'];

interface StatusFilterProps {
  value: TaskStatusFilter;
  onChange: (value: TaskStatusFilter) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <ChipGroup options={OPTIONS} labels={STATUS_FILTER_LABELS} value={value} onChange={onChange} />
  );
}
