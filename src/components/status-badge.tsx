
"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type TravelRequestStatus } from '@/types';

interface StatusBadgeProps {
  status: TravelRequestStatus;
  onStatusChange: (newStatus: TravelRequestStatus) => void;
}

const statusConfig: Record<TravelRequestStatus, { label: string; className: string }> = {
  Draft: { label: 'Rascunho', className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700' },
  Submitted: { label: 'Enviado', className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700' },
  Approved: { label: 'Aprovado', className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' },
  Rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700' },
};

export function StatusBadge({ status, onStatusChange }: StatusBadgeProps) {
  return (
    <Select value={status} onValueChange={(value) => onStatusChange(value as TravelRequestStatus)}>
      <SelectTrigger className="w-auto h-auto p-0 border-none focus:ring-0 focus:ring-offset-0 bg-transparent">
        <SelectValue asChild>
          <Badge variant="outline" className={`cursor-pointer ${statusConfig[status].className}`}>
            {statusConfig[status].label}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([key, { label }]) => (
          <SelectItem key={key} value={key as TravelRequestStatus}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
