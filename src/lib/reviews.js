import { useCallback, useEffect, useState } from 'react';

export async function fetchReviews({ limit = 12, offset = 0, sort = 'newest' } = {}) {
  const res = await fetch(`/api/reviews?limit=${limit}&offset=${offset}&sort=${sort}`, { headers: { Accept: 'application/json' } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not load reviews.');
  return data;
}

export async function postReview(payload) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Could not send your review.');
    err.fields = data.fields || {};
    throw err;
  }
  return data.review;
}

export function useReviews({ limit = 12, sort = 'newest' } = {}) {
  const [state, setState] = useState({ loading: true, error: '', reviews: [], stats: null, hasMore: false });

  const load = useCallback(
    async (append = false, offset = 0) => {
      setState((s) => ({ ...s, loading: true, error: '' }));
      try {
        const data = await fetchReviews({ limit, offset, sort });
        setState((s) => {
          const reviews = append ? [...s.reviews, ...data.reviews] : data.reviews;
          return { loading: false, error: '', reviews, stats: data.stats, hasMore: reviews.length < (data.stats?.count || 0) };
        });
      } catch (e) {
        setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    },
    [limit, sort],
  );

  useEffect(() => { load(false, 0); }, [load]);

  return {
    ...state,
    reload: () => load(false, 0),
    loadMore: () => load(true, state.reviews.length),
  };
}

export const ratingWords = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' };

export function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
