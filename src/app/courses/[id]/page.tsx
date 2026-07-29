import type { Metadata } from 'next';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/services';
import { CourseCard } from '@/components/courses/CourseCard';
import { CoursePreviewModal } from '@/components/courses/CoursePreviewModal';

export default function CourseDetailPage() {
  const params = useParams();
  const id = (params as any)?.id as string | undefined;
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const defaultTitle = 'Hamplard Course';
  const defaultDescription =
    'Explore Hamplard practical online courses with step-by-step learning and blockchain certification.';
  const url = `https://hamplard.app/courses/${params.id}`;

  try {
    const course = await coursesApi.get(params.id);
    const title = course?.title ? `${course.title} | Hamplard` : defaultTitle;
    const description =
      course?.description ||
      `${course.title ?? 'A Hamplard course'} with practical learning and verified certification.`;
    const image = course?.thumbnailUrl ?? DEFAULT_OG_IMAGE;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'Hamplard',
        type: 'article',
        images: [{ url: image, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        url,
        siteName: 'Hamplard',
        type: 'article',
        images: [{ url: DEFAULT_OG_IMAGE, alt: defaultTitle }],
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description: defaultDescription,
        images: [DEFAULT_OG_IMAGE],
      },
    };
  }
}

  if (loading) return <CourseDetailSkeleton />;

  if (!course) return (
    <div className="card p-8 text-center">
      <p className="text-sm font-medium text-ink-700">Course not found</p>
    </div>
  );

  const sampleModules = [
    { id: 'm1', title: 'Introduction', lessons: ['Welcome', 'How to use this course'] },
    { id: 'm2', title: 'Basics', lessons: ['Lesson 1', 'Lesson 2', 'Lesson 3'] },
  ];

  return (
    <>
      {/* Preview Modal */}
      {course.previewVideoUrl && (
        <CoursePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          videoUrl={course.previewVideoUrl}
          courseTitle={course.title}
          instructorName={course.instructor?.name}
        />
      )}

      <div className="grid grid-cols-12 gap-6">
      <main className="col-span-12 lg:col-span-8">
        {/* Banner */}
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-saffron-100 to-saffron-200 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-36 h-24 bg-ink-100 rounded-md flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-semibold text-ink-900">{course.title}</h1>
                <p className="text-sm text-ink-500 mt-1">{course.subtitle ?? course.description?.slice(0, 140)}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-ink-500">
                  <span>{course.rating ?? '—'} ★</span>
                  <span>{course._count?.enrollments ?? 0} students</span>
                  <span className="capitalize">{course.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalMinutes = courseTotalMins(course.totalDuration ?? 0);
  const lessons = course.modules?.flatMap((module) => module.lessons).length ?? 0;

  return (
    <div className="min-h-screen bg-ink-50 px-5 py-16">
      <RecentlyViewedTracker courseId={course.id} />
      <div className="mx-auto max-w-6xl space-y-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors">
          ← Back to Hamplard
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-saffron-100 to-saffron-200 aspect-video">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🎓</div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-ink-500">
                <span className="rounded-full border border-ink-200 bg-white px-3 py-1.5 font-medium text-ink-600">{course.category}</span>
                <span className="rounded-full border border-ink-200 bg-white px-3 py-1.5 font-medium text-ink-600">{course.level}</span>
                <span className="rounded-full border border-ink-200 bg-white px-3 py-1.5 font-medium text-ink-600">{course.language}</span>
              </div>
              <h1 className="font-display text-4xl font-bold text-ink-900">{course.title}</h1>
              <p className="text-lg leading-relaxed text-ink-500">{course.description ?? 'A practical Hamplard course with verified lessons and certification.'}</p>
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-400">Course details</p>
              <div className="text-sm text-ink-600">
                <p><span className="font-medium text-ink-900">Price:</span> {formatUsdc(course.price)} USDC</p>
                <p><span className="font-medium text-ink-900">Lessons:</span> {lessons}</p>
                <p><span className="font-medium text-ink-900">Duration:</span> {totalMinutes} min</p>
                <p><span className="font-medium text-ink-900">Instructor:</span> {course.instructor?.name ?? 'Hamplard Instructor'}</p>
              </div>
            </div>
            <button className="btn-primary w-full mt-4">Enroll now</button>
            <button
              onClick={() => setPreviewOpen(true)}
              disabled={!course.previewVideoUrl}
              className="btn-secondary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {course.previewVideoUrl ? 'Preview this course' : 'No preview available'}
            </button>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold">Course highlights</h3>
            <ul className="text-sm text-ink-600 mt-2 space-y-1">
              <li>Lifetime access</li>
              <li>Certificate of completion</li>
              <li>30-day money-back</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-ink-100 lg:hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium">{course.title}</div>
            <div className="text-xs text-ink-500">{course.price ? `$${(course.price / 100).toFixed(2)}` : 'Free'}</div>
          </div>
          <button className="btn-primary px-4 py-2">Enroll</button>
        </div>
      </div>
    </>
  );
}
