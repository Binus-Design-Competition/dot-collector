import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import { HeatmapGrid } from '../Grid/HeatmapGrid';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import { Users } from 'lucide-react';

export const MyFeedbackTab = ({ sessionId, session }) => {
    const { userDoc } = useAuth();
    const { reviews } = useReviews(sessionId, { targetUserId: userDoc?.id });

    // Group reviews by category
    const reviewsByCategory = useMemo(() => {
        const grouped = {};
        EVALUATION_CONFIG.forEach(cat => {
            grouped[cat.category] = reviews.filter(r => r.category === cat.category);
        });
        return grouped;
    }, [reviews]);

    // Calculate overall statistics
    const stats = useMemo(() => {
        if (reviews.length === 0) return null;

        const allScores = [];
        reviews.forEach(review => {
            Object.values(review.ratings || {}).forEach(score => {
                if (score > 0) allScores.push(score);
            });
        });

        if (allScores.length === 0) return null;

        return {
            totalReviewers: new Set(reviews.map(r => r.reviewerId)).size,
            totalReviews: reviews.length,
            averageScore: (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2),
            highestScore: Math.max(...allScores),
            lowestScore: Math.min(...allScores)
        };
    }, [reviews]);

    if (!userDoc) return null;

    return (
        <div className="space-y-6">
            {/* Statistics Card */}
            {stats && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={24} />
                        <h3 className="text-xl font-bold">Your Feedback Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <p className="text-blue-100 text-sm">Reviewers</p>
                            <p className="text-2xl font-bold">{stats.totalReviewers}</p>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm">Reviews</p>
                            <p className="text-2xl font-bold">{stats.totalReviews}</p>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm">Avg Score</p>
                            <p className="text-2xl font-bold">{stats.averageScore}</p>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm">Highest</p>
                            <p className="text-2xl font-bold">{stats.highestScore}</p>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm">Lowest</p>
                            <p className="text-2xl font-bold">{stats.lowestScore}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews by Category */}
            {EVALUATION_CONFIG.map((catConfig) => {
                const categoryReviews = reviewsByCategory[catConfig.category];

                if (!categoryReviews || categoryReviews.length === 0) {
                    return null;
                }

                return (
                    <div key={catConfig.category} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {catConfig.category}
                        </h3>
                        <HeatmapGrid
                            reviews={reviews}
                            targetUserId={userDoc.id}
                            category={catConfig.category}
                            privacyMode={session?.privacyMode}
                            sessionStatus={session?.status}
                        />
                    </div>
                );
            })}

            {reviews.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-12 shadow text-center">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No feedback received yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Once others submit reviews, they'll appear here
                    </p>
                </div>
            )}
        </div>
    );
};
