import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  formatReviewDueLabel,
  getDecoratorReviewState,
  type ReviewFrequencyMonths,
} from '../utils/decoratorReview';

const OVERRIDES_KEY = 'jolly_decorator_review_overrides';
const DISMISSED_KEY = 'jolly_decorator_review_dismissed';

export interface ReviewOverride {
  reviewFrequencyMonths?: ReviewFrequencyMonths;
  /** ISO date string (yyyy-mm-dd). Omit key to keep seed default. */
  lastReviewedDate?: string;
}

type OverridesMap = Record<string, ReviewOverride>;

function loadOverrides(): OverridesMap {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (raw) return JSON.parse(raw) as OverridesMap;
  } catch {
    /* ignore */
  }
  return {};
}

function saveOverrides(map: OverridesMap) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveDismissed(set: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/** Merge persisted review fields onto a decorator row (seed + runtime list). */
export function mergeReviewFields<T extends {
  id: string;
  isAppaLinked: boolean;
  reviewFrequencyMonths?: ReviewFrequencyMonths;
  lastReviewedDate?: string;
}>(decorator: T, overrides: OverridesMap): T {
  const o = overrides[decorator.id];
  if (!o) {
    if (decorator.isAppaLinked) return decorator;
    return {
      ...decorator,
      reviewFrequencyMonths: decorator.reviewFrequencyMonths ?? 12,
      lastReviewedDate: decorator.lastReviewedDate,
    };
  }
  return {
    ...decorator,
    reviewFrequencyMonths:
      o.reviewFrequencyMonths ?? decorator.reviewFrequencyMonths ?? 12,
    lastReviewedDate:
      o.lastReviewedDate !== undefined
        ? o.lastReviewedDate || undefined
        : decorator.lastReviewedDate,
  };
}

export interface DashboardReviewRow {
  id: string;
  decorator: string;
  status: 'overdue' | 'due-soon';
  dueLabel: string;
}

interface DecoratorReviewContextValue {
  overrides: OverridesMap;
  mergeReview: <T extends Parameters<typeof mergeReviewFields>[0]>(decorator: T) => T;
  updateReview: (decoratorId: string, patch: ReviewOverride) => void;
  dismissReviewAlert: (decoratorId: string) => void;
  isDismissed: (decoratorId: string) => boolean;
  getDashboardReviewRows: <T extends {
    id: string;
    name: string;
    isAppaLinked: boolean;
    reviewFrequencyMonths?: ReviewFrequencyMonths;
    lastReviewedDate?: string;
  }>(decorators: T[]) => DashboardReviewRow[];
}

const DecoratorReviewContext = createContext<DecoratorReviewContextValue | undefined>(undefined);

export function DecoratorReviewProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OverridesMap>(() =>
    typeof window !== 'undefined' ? loadOverrides() : {},
  );
  const [dismissed, setDismissed] = useState<Set<string>>(() =>
    typeof window !== 'undefined' ? loadDismissed() : new Set(),
  );

  const mergeReview = useCallback(
    <T extends Parameters<typeof mergeReviewFields>[0]>(d: T) => mergeReviewFields(d, overrides),
    [overrides],
  );

  const updateReview = useCallback((decoratorId: string, patch: ReviewOverride) => {
    setOverrides((prev) => {
      const next: OverridesMap = {
        ...prev,
        [decoratorId]: { ...prev[decoratorId], ...patch },
      };
      saveOverrides(next);
      return next;
    });
    // Updating last reviewed clears dashboard dismiss for this decorator (brief: auto-clear)
    if (patch.lastReviewedDate !== undefined) {
      setDismissed((prev) => {
        if (!prev.has(decoratorId)) return prev;
        const n = new Set(prev);
        n.delete(decoratorId);
        saveDismissed(n);
        return n;
      });
    }
  }, []);

  const dismissReviewAlert = useCallback((decoratorId: string) => {
    setDismissed((prev) => {
      const n = new Set(prev);
      n.add(decoratorId);
      saveDismissed(n);
      return n;
    });
  }, []);

  const isDismissed = useCallback((id: string) => dismissed.has(id), [dismissed]);

  const getDashboardReviewRows = useCallback(
    <T extends {
      id: string;
      name: string;
      isAppaLinked: boolean;
      reviewFrequencyMonths?: ReviewFrequencyMonths;
      lastReviewedDate?: string;
    }>(decorators: T[]): DashboardReviewRow[] => {
      const rows: DashboardReviewRow[] = [];
      for (const d of decorators) {
        if (d.isAppaLinked) continue;
        const m = mergeReviewFields(d, overrides);
        const state = getDecoratorReviewState(
          m.isAppaLinked,
          m.lastReviewedDate,
          m.reviewFrequencyMonths,
        );
        if (!state || state.label === 'Up to date') continue;
        if (dismissed.has(m.id)) continue;
        const label = formatReviewDueLabel(
          m.isAppaLinked,
          m.lastReviewedDate,
          m.reviewFrequencyMonths,
        );
        if (!label) continue;
        rows.push({
          id: m.id,
          decorator: m.name,
          status: label.status,
          dueLabel: label.text,
        });
      }
      return rows;
    },
    [overrides, dismissed],
  );

  const value = useMemo(
    () => ({
      overrides,
      mergeReview,
      updateReview,
      dismissReviewAlert,
      isDismissed,
      getDashboardReviewRows,
    }),
    [overrides, mergeReview, updateReview, dismissReviewAlert, isDismissed, getDashboardReviewRows],
  );

  return (
    <DecoratorReviewContext.Provider value={value}>
      {children}
    </DecoratorReviewContext.Provider>
  );
}

export function useDecoratorReview() {
  const ctx = useContext(DecoratorReviewContext);
  if (!ctx) throw new Error('useDecoratorReview must be used within DecoratorReviewProvider');
  return ctx;
}
