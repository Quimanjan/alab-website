import { useState } from 'react';
import { BriquetteArt } from '../components/Art.jsx';
import { PageHero, Reveal } from '../components/UI.jsx';
import { RatingSummary, ReviewCard, ReviewForm } from '../components/Reviews.jsx';
import { useReviews } from '../lib/reviews.js';

export default function Reviews() {
  const [sort, setSort] = useState('newest');
  const { reviews, stats, loading, error, hasMore, loadMore, reload } = useReviews({ limit: 8, sort });

  return (
    <>
      <PageHero
        crumb="Reviews"
        eyebrow="Ratings & feedback"
        title={<>Bought it? Used it? <em>Rate it.</em></>}
        lead="Once you’ve brought your ALAB briquettes home and fired them up, tell us how they did. Your 1–5 star rating and feedback go straight to the team and help other customers decide."
      />
      <div className="wrap">
        <section className="block" style={{ marginTop: 44 }}>
          <RatingSummary stats={stats} loading={loading} />
        </section>

        <section className="block" style={{ marginTop: 40 }}>
          <div className="grid-2 reviews-grid">
            <Reveal className="card pad glow" id="rate" style={{ scrollMarginTop: 110 }}>
              <span className="eyebrow">Leave a review</span>
              <h2 className="title" style={{ fontSize: 38, marginBottom: 26 }}>How did ALAB <em>burn?</em></h2>
              <ReviewForm onPosted={() => { setSort('newest'); reload(); }} />
            </Reveal>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <h2 className="serif" style={{ fontSize: 28, fontWeight: 500 }}>What customers say</h2>
                <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                  <span className="mute" style={{ fontSize: 13 }}>Sort</span>
                  <select className="select" style={{ width: 'auto', minHeight: 44, padding: '10px 40px 10px 14px' }} value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="highest">Highest rated</option>
                    <option value="lowest">Lowest rated</option>
                  </select>
                </label>
              </div>

              {error && <div className="notice bad" role="alert">{error}</div>}

              {!error && !loading && reviews.length === 0 && (
                <div className="card empty">
                  <BriquetteArt size={96} />
                  <b>No reviews yet</b>
                  <p className="mute" style={{ margin: 0 }}>Be the first to rate ALAB — your feedback helps the team improve.</p>
                </div>
              )}

              <div style={{ display: 'grid', gap: 14 }}>
                {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
                {loading && [0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 120 }} />)}
              </div>

              {hasMore && !loading && (
                <button type="button" className="btn line" style={{ marginTop: 18, width: '100%' }} onClick={loadMore}>Show more reviews</button>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
