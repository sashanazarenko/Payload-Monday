/** Third-party decorator pricing review cadence (Change 8). */

export type ReviewFrequencyMonths = 6 | 12 | 24;

export type ReviewStateLabel = 'Up to date' | 'Review due soon' | 'Review overdue';

export interface ReviewStateBadge {
  label: ReviewStateLabel;
  color: string;
  bg: string;
}

/** Days until next due (negative = overdue). Null if cannot compute. */
export function getDaysUntilReviewDue(
  lastReviewedDate: string | undefined,
  reviewFrequencyMonths: number | undefined,
): number | null {
  if (!lastReviewedDate) return null;
  const freq = normalizeFrequency(reviewFrequencyMonths);
  const last = new Date(lastReviewedDate);
  if (Number.isNaN(last.getTime())) return null;
  const due = new Date(last);
  due.setMonth(due.getMonth() + freq);
  return Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function normalizeFrequency(m: number | undefined): ReviewFrequencyMonths {
  if (m === 6 || m === 12 || m === 24) return m;
  return 12;
}

/**
 * APPA-linked: no review UI state.
 * Manual with no last-reviewed: treat as overdue (never verified).
 */
export function getDecoratorReviewState(
  isAppaLinked: boolean,
  lastReviewedDate: string | undefined,
  reviewFrequencyMonths: number | undefined,
): ReviewStateBadge | null {
  if (isAppaLinked) return null;
  const freq = normalizeFrequency(reviewFrequencyMonths);
  if (!lastReviewedDate) {
    return { label: 'Review overdue', color: '#C0392B', bg: '#FFEBEE' };
  }
  const days = getDaysUntilReviewDue(lastReviewedDate, freq);
  if (days === null) return null;
  if (days < 0) return { label: 'Review overdue', color: '#C0392B', bg: '#FFEBEE' };
  if (days <= 30) return { label: 'Review due soon', color: '#92400E', bg: '#FFFBEB' };
  return { label: 'Up to date', color: '#217346', bg: '#E8F5E9' };
}

export function formatReviewDueLabel(
  isAppaLinked: boolean,
  lastReviewedDate: string | undefined,
  reviewFrequencyMonths: number | undefined,
): { status: 'overdue' | 'due-soon'; text: string } | null {
  const state = getDecoratorReviewState(isAppaLinked, lastReviewedDate, reviewFrequencyMonths);
  if (!state || state.label === 'Up to date') return null;
  const freq = normalizeFrequency(reviewFrequencyMonths);
  const days = getDaysUntilReviewDue(lastReviewedDate, freq);
  if (state.label === 'Review overdue') {
    if (days === null) return { status: 'overdue', text: 'Review required — no last review date' };
    const abs = Math.abs(days);
    return { status: 'overdue', text: `Overdue by ${abs} day${abs === 1 ? '' : 's'}` };
  }
  if (days !== null && days >= 0) {
    return { status: 'due-soon', text: `Due in ${days} day${days === 1 ? '' : 's'}` };
  }
  return { status: 'due-soon', text: 'Review due soon' };
}

export function computeNextReviewDueDisplay(
  lastReviewedDate: string | undefined,
  reviewFrequencyMonths: number | undefined,
): string {
  if (!lastReviewedDate) return '—';
  const freq = normalizeFrequency(reviewFrequencyMonths);
  const last = new Date(lastReviewedDate);
  if (Number.isNaN(last.getTime())) return '—';
  const due = new Date(last);
  due.setMonth(due.getMonth() + freq);
  return due.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}
