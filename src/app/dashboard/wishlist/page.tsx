'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { coursesApi } from '@/lib/api/services';
import { CourseCard } from '@/components/courses/CourseCard';
import { useWishlistHydrated, useWishlistStore } from '@/lib/hooks/use-wishlist-store';
import type { Course } from '@/types';

export default function WishlistPage() {
  const courseIds = useWishlistStore((state) => state.courseIds);
  const hydrated  = useWishlistHydrated();

  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(true);
  // Ids we have already tried to fetch, so a course that 404s is not re-requested
  // on every render.
  const requested = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!hydrated) return;

    const missing = courseIds.filter((id) => !requested.current.has(id));
    if (missing.length === 0) { setLoading(false); return; }
    missing.forEach((id) => requested.current.add(id));

    let cancelled = false;
    setLoading(true);

    Promise.all(
      missing.map((id) =>
        coursesApi.get(id)
          .then((course) => [id, course] as const)
          .catch(() => null),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        setCourses((prev) => {
          const next = { ...prev };
          results.forEach((entry) => { if (entry) next[entry[0]] = entry[1]; });
          return next;
        });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [hydrated, courseIds]);

  // Driven by the store's order so un-hearting a card removes it immediately.
  const saved       = courseIds.map((id) => courses[id]).filter(Boolean) as Course[];
  const unavailable = hydrated && !loading ? courseIds.length - saved.length : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-heading">Wishlist</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {courseIds.length} course{courseIds.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link href="/" className="btn-secondary">
          Browse courses
        </Link>
      </div>

      {!hydrated || loading ? (
        <div className="course-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-video bg-ink-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-ink-100 rounded w-20" />
                <div className="h-4 bg-ink-100 rounded w-full" />
                <div className="h-3 bg-ink-100 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : courseIds.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-10 h-10 text-saffron-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-ink-700">Your wishlist is empty</p>
          <p className="text-xs text-ink-400 mt-1">
            Tap the heart on any course to save it for later.
          </p>
          <Link href="/" className="btn-primary mt-4 inline-flex">
            Browse courses
          </Link>
        </div>
      ) : (
        <>
          <div className="course-grid">
            {saved.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {unavailable > 0 && (
            <p className="text-xs text-ink-400 mt-4">
              {unavailable} saved course{unavailable !== 1 ? 's' : ''} could not be loaded right now.
            </p>
          )}
        </>
      )}
    </div>
  );
}
