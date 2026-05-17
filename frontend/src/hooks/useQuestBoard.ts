import { useState, useMemo } from 'react';
import { Job, JobStatus } from '../types';

export function useQuestBoard(initialData: Job[]) {
  const [data, setData] = useState<Job[]>(initialData);
  const [filter, setFilter] = useState<JobStatus | 'All'>('All');
  const [sortField, setSortField] = useState<keyof Job>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Job) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = data;
    
    if (filter !== 'All') {
      result = result.filter(job => job.status === filter);
    }
    
    result = [...result].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortField === 'deadline') {
        return sortOrder === 'asc' 
          ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      
      const stringA = String(aValue).toLowerCase();
      const stringB = String(bValue).toLowerCase();
      
      if (stringA < stringB) return sortOrder === 'asc' ? -1 : 1;
      if (stringA > stringB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [data, filter, sortField, sortOrder]);

  return {
    data: filteredAndSortedData,
    filter,
    setFilter,
    sortField,
    sortOrder,
    handleSort
  };
}
