import { Star } from "lucide-react";

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  distribution: {
    stars: number;
    count: number;
  }[];
}

export default function RatingSummary({
  averageRating,
  totalReviews,
  distribution,
}: RatingSummaryProps) {
  const totalRatings = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-xl border border-ink-100 p-6">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Overall Rating */}
        <div className="text-center md:w-56">
          <h2 className="text-5xl font-bold text-ink-900">
            {averageRating.toFixed(1)}
          </h2>

          <div className="mt-2 flex justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <p className="mt-2 text-sm text-ink-500">
            {totalReviews.toLocaleString()} reviews
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-3">
          {distribution.map((item) => {
            const percentage =
              totalRatings === 0 ? 0 : (item.count / totalRatings) * 100;

            return (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium text-ink-700">
                  {item.stars}★
                </span>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-10 text-right text-sm text-ink-500">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
