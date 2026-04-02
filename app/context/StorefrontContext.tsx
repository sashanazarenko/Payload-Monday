import { createContext, useContext, useState, ReactNode } from 'react';
import { StorefrontStatus } from '../types';
import { mockProducts } from '../data/mockProducts';

interface StorefrontContextType {
  statuses: Record<string, StorefrontStatus>;
  getStatus: (productId: string) => StorefrontStatus;
  setStatus: (productId: string, status: StorefrontStatus) => void;
  bulkSetStatus: (productIds: string[], status: StorefrontStatus) => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const initialStatuses: Record<string, StorefrontStatus> = Object.fromEntries(
    mockProducts.map(p => [p.id, p.storefrontStatus ?? 'unpublished'])
  );

  const [statuses, setStatuses] = useState<Record<string, StorefrontStatus>>(initialStatuses);

  const getStatus = (productId: string): StorefrontStatus =>
    statuses[productId] ?? 'unpublished';

  const setStatus = (productId: string, status: StorefrontStatus) =>
    setStatuses(prev => ({ ...prev, [productId]: status }));

  const bulkSetStatus = (productIds: string[], status: StorefrontStatus) =>
    setStatuses(prev => {
      const next = { ...prev };
      productIds.forEach(id => { next[id] = status; });
      return next;
    });

  return (
    <StorefrontContext.Provider value={{ statuses, getStatus, setStatus, bulkSetStatus }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error('useStorefront must be used within StorefrontProvider');
  return context;
}
