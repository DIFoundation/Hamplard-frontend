'use client';

import { CourseCard } from './CourseCard';
import { CourseCardSkeleton } from './CourseCardSkeleton';
import type { Course } from '@/types';

interface Props {
  courses: Course[];
  loading?: boolean;
  skeletons?: number;
  /**
   * Number of cards in the above-the-fold row. Those cards get priority loading;
   * the rest are lazy-loaded. Defaults to 4 (matches the 4-column max-width grid).
   */
  aboveFoldCount?: number;
}

export function CourseCardGrid({ courses, loading = false, skeletons = 8, aboveFoldCount = 4 }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))
        : courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              priority={index < aboveFoldCount}
            />
          ))}
    </div>
  );
}
