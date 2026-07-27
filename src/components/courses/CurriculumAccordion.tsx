'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Play, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseModule, Lesson } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSectionDuration(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}min`;
}

function formatLectureDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface CurriculumAccordionProps {
  modules: CourseModule[];
}

// ─── Placeholder data (used when modules array is empty) ─────────────────────

const PLACEHOLDER_MODULES: CourseModule[] = [
  {
    id: 'mod-1',
    courseId: 'course-1',
    title: 'Getting Started',
    position: 1,
    lessons: [
      {
        id: 'les-1',
        moduleId: 'mod-1',
        title: 'Welcome to the Course',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 180,
        content: null,
        resourceUrl: null,
        position: 1,
        isFree: true,
      },
      {
        id: 'les-2',
        moduleId: 'mod-1',
        title: 'Course Overview & What You Will Learn',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 420,
        content: null,
        resourceUrl: null,
        position: 2,
        isFree: true,
      },
      {
        id: 'les-3',
        moduleId: 'mod-1',
        title: 'Setting Up Your Workspace',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 540,
        content: null,
        resourceUrl: null,
        position: 3,
        isFree: false,
      },
    ],
  },
  {
    id: 'mod-2',
    courseId: 'course-1',
    title: 'Core Fundamentals',
    position: 2,
    lessons: [
      {
        id: 'les-4',
        moduleId: 'mod-2',
        title: 'Understanding the Basics',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 720,
        content: null,
        resourceUrl: null,
        position: 1,
        isFree: false,
      },
      {
        id: 'les-5',
        moduleId: 'mod-2',
        title: 'Hands-On Practice Session',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 900,
        content: null,
        resourceUrl: null,
        position: 2,
        isFree: false,
      },
      {
        id: 'les-6',
        moduleId: 'mod-2',
        title: 'Common Mistakes to Avoid',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 480,
        content: null,
        resourceUrl: null,
        position: 3,
        isFree: true,
      },
    ],
  },
  {
    id: 'mod-3',
    courseId: 'course-1',
    title: 'Advanced Techniques',
    position: 3,
    lessons: [
      {
        id: 'les-7',
        moduleId: 'mod-3',
        title: 'Professional Workflow',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 660,
        content: null,
        resourceUrl: null,
        position: 1,
        isFree: false,
      },
      {
        id: 'les-8',
        moduleId: 'mod-3',
        title: 'Real-World Project',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 1200,
        content: null,
        resourceUrl: null,
        position: 2,
        isFree: false,
      },
    ],
  },
  {
    id: 'mod-4',
    courseId: 'course-1',
    title: 'Final Project & Next Steps',
    position: 4,
    lessons: [
      {
        id: 'les-9',
        moduleId: 'mod-4',
        title: 'Building Your Portfolio Piece',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 1500,
        content: null,
        resourceUrl: null,
        position: 1,
        isFree: false,
      },
      {
        id: 'les-10',
        moduleId: 'mod-4',
        title: 'Where to Go From Here',
        description: null,
        type: 'VIDEO',
        videoUrl: '#',
        videoDuration: 300,
        content: null,
        resourceUrl: null,
        position: 2,
        isFree: true,
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function CurriculumAccordion({ modules }: CurriculumAccordionProps) {
  const data = modules.length > 0 ? modules : PLACEHOLDER_MODULES;

  // First section expanded by default
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(data.length > 0 ? [data[0].id] : []),
  );

  const stats = useMemo(() => {
    let totalLectures = 0;
    let totalDurationSecs = 0;
    for (const mod of data) {
      totalLectures += mod.lessons.length;
      for (const lesson of mod.lessons) {
        totalDurationSecs += lesson.videoDuration ?? 0;
      }
    }
    return { totalLectures, totalDurationSecs };
  }, [data]);

  const allExpanded = expandedIds.size === data.length;

  function toggleSection(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(data.map((m) => m.id)));
    }
  }

  return (
    <div>
      {/* ── Summary bar ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-ink-700">
            {stats.totalLectures}
          </span>{' '}
          lectures &middot;{' '}
          <span className="font-semibold text-ink-700">
            {formatSectionDuration(stats.totalDurationSecs)}
          </span>{' '}
          total length
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-medium text-hamplard-primary transition-colors hover:text-hamplard-mid"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* ── Sections ── */}
      <div className="divide-y divide-ink-100 rounded-xl border border-ink-200 overflow-hidden">
        {data.map((mod) => {
          const isOpen = expandedIds.has(mod.id);
          const lectureCount = mod.lessons.length;
          const sectionSecs = mod.lessons.reduce(
            (sum, l) => sum + (l.videoDuration ?? 0),
            0,
          );

          return (
            <div key={mod.id}>
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(mod.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 bg-ink-50 px-4 py-3.5 text-left transition-colors hover:bg-ink-100"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
                <span className="flex-1 text-sm font-semibold text-ink-900">
                  {mod.title}
                </span>
                <span className="hidden text-xs text-ink-500 sm:inline">
                  {lectureCount} lecture{lectureCount !== 1 ? 's' : ''} &middot;{' '}
                  {formatSectionDuration(sectionSecs)}
                </span>
              </button>

              {/* Lessons list */}
              {isOpen && (
                <ul className="animate-fade-in">
                  {mod.lessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Lesson row ──────────────────────────────────────────────────────────────

function LessonRow({ lesson }: { lesson: Lesson }) {
  const duration = lesson.videoDuration ?? 0;
  const isPreview = lesson.isFree;

  const content = (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
        isPreview
          ? 'hover:bg-hamplard-lilac/40 cursor-pointer'
          : 'cursor-default',
      )}
    >
      <Play className="h-4 w-4 flex-shrink-0 text-ink-400" />
      <span
        className={cn(
          'flex-1',
          isPreview ? 'text-ink-900' : 'text-ink-700',
        )}
      >
        {lesson.title}
      </span>
      {isPreview && (
        <span className="inline-flex items-center gap-1 rounded-md bg-hamplard-lilac px-2 py-0.5 text-xs font-medium text-hamplard-deep">
          <Eye className="h-3 w-3" />
          Preview
        </span>
      )}
      {duration > 0 && (
        <span className="flex items-center gap-1 text-xs text-ink-400">
          <Clock className="h-3 w-3" />
          {formatLectureDuration(duration)}
        </span>
      )}
    </li>
  );

  if (isPreview && lesson.videoUrl) {
    return (
      <a
        href={lesson.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}
