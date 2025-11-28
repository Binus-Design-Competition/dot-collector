import { useMemo } from 'react';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import { getScoreColor } from '../../utils/colors';

export const HeatmapGrid = ({
    reviews,
    targetUserId,
    category,
    privacyMode,
    sessionStatus
}) => {
    const categoryConfig = EVALUATION_CONFIG.find(c => c.category === category);

    if (!categoryConfig) return null;

    // Filter reviews for this target and category
    const targetReviews = useMemo(() => {
        return reviews.filter(r =>
            r.targetUserId === targetUserId &&
            r.category === category
        );
    }, [reviews, targetUserId, category]);

    // Determine if we should show names
    const showNames = privacyMode === 'always_reveal' || sessionStatus === 'closed';

    // Calculate average scores per metric
    const averages = useMemo(() => {
        const avgs = {};
        categoryConfig.metrics.forEach(metric => {
            const scores = targetReviews
                .map(r => r.ratings?.[metric.id])
                .filter(s => s > 0);

            if (scores.length > 0) {
                avgs[metric.id] = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
            } else {
                avgs[metric.id] = null;
            }
        });
        return avgs;
    }, [targetReviews, categoryConfig]);

    if (targetReviews.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No reviews yet for this category
            </div>
        );
    }

    return (
        <div className="overflow-x-auto heatmap-scroll">
            <div className="min-w-max">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-3 text-left font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-slate-600 min-w-[180px]">
                                Metric
                            </th>
                            {targetReviews.map((review, idx) => (
                                <th
                                    key={review.id}
                                    className="p-3 text-center font-semibold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-slate-600 min-w-[80px]"
                                >
                                    {showNames ? review.reviewerName : `Rev ${idx + 1}`}
                                </th>
                            ))}
                            <th className="p-3 text-center font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-slate-600 min-w-[80px] bg-blue-50 dark:bg-blue-900/20">
                                Avg
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryConfig.metrics.map((metric) => (
                            <tr key={metric.id} className="border-b border-gray-200 dark:border-slate-700">
                                <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-3 font-medium text-gray-900 dark:text-white">
                                    {metric.label}
                                </td>
                                {targetReviews.map((review) => {
                                    const score = review.ratings?.[metric.id] || 0;
                                    const colors = getScoreColor(score);

                                    return (
                                        <td key={review.id} className="p-2">
                                            {score > 0 ? (
                                                <div className={`
                          w-full h-12 flex items-center justify-center
                          rounded-lg font-bold text-lg
                          ${colors.bg} ${colors.text}
                        `}>
                                                    {score}
                                                </div>
                                            ) : (
                                                <div className="w-full h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-400">
                                                    -
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="p-2 bg-blue-50 dark:bg-blue-900/20">
                                    {averages[metric.id] ? (
                                        <div className="w-full h-12 flex items-center justify-center font-bold text-lg text-blue-700 dark:text-blue-400">
                                            {averages[metric.id]}
                                        </div>
                                    ) : (
                                        <div className="w-full h-12 flex items-center justify-center text-gray-400">
                                            -
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
