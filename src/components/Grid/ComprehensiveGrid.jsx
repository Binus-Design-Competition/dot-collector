import { useMemo } from 'react';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import { getScoreColor } from '../../utils/colors';

export const ComprehensiveGrid = ({
    reviews,
    allUsers,
    selectedCategory,
    filteredPeople = [],
    privacyMode,
    sessionStatus
}) => {
    // Determine if we should show names
    const showNames = privacyMode === 'always_reveal' || sessionStatus === 'closed';

    // Filter users if people filter is applied
    const displayUsers = useMemo(() => {
        if (filteredPeople.length === 0) return allUsers;
        return allUsers.filter(u => filteredPeople.includes(u.id));
    }, [allUsers, filteredPeople]);

    // Calculate average scores for each person
    const userAverages = useMemo(() => {
        const averages = {};

        displayUsers.forEach(user => {
            // Get all reviews for this user
            const userReviews = reviews.filter(r => r.targetUserId === user.id);

            if (selectedCategory === 'All Categories') {
                // Calculate average across ALL categories (that have reviews)
                const allScores = [];

                userReviews.forEach(review => {
                    Object.values(review.ratings || {}).forEach(score => {
                        if (score > 0) allScores.push(score);
                    });
                });

                averages[user.id] = {
                    overallAverage: allScores.length > 0
                        ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
                        : null,
                    reviewerScores: {} // Will store reviewer -> average score across all their reviews
                };

                // Group scores by reviewer across ALL categories
                const reviewerScores = {};
                userReviews.forEach(review => {
                    if (!reviewerScores[review.reviewerId]) {
                        reviewerScores[review.reviewerId] = {
                            scores: [],
                            name: review.reviewerName
                        };
                    }
                    Object.values(review.ratings || {}).forEach(score => {
                        if (score > 0) reviewerScores[review.reviewerId].scores.push(score);
                    });
                });

                // Calculate average for each reviewer
                Object.entries(reviewerScores).forEach(([reviewerId, data]) => {
                    if (data.scores.length > 0) {
                        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
                        averages[user.id].reviewerScores[reviewerId] = {
                            score: parseFloat(avg.toFixed(1)),
                            reviewerName: data.name
                        };
                    }
                });
            } else {
                // Calculate average for selected category only
                const categoryReviews = userReviews.filter(r => r.category === selectedCategory);

                const categoryScores = [];
                categoryReviews.forEach(review => {
                    Object.values(review.ratings || {}).forEach(score => {
                        if (score > 0) categoryScores.push(score);
                    });
                });

                averages[user.id] = {
                    overallAverage: categoryScores.length > 0
                        ? (categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length).toFixed(1)
                        : null,
                    reviewerScores: {}
                };

                // Group scores by reviewer for this category
                categoryReviews.forEach(review => {
                    const reviewScores = Object.values(review.ratings || {}).filter(s => s > 0);
                    if (reviewScores.length > 0) {
                        const avg = (reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length).toFixed(1);
                        averages[user.id].reviewerScores[review.reviewerId] = {
                            score: parseFloat(avg),
                            reviewerName: review.reviewerName
                        };
                    }
                });
            }
        });

        return averages;
    }, [displayUsers, reviews, selectedCategory]);

    // Get list of all reviewers (for columns)
    const allReviewers = useMemo(() => {
        const reviewerSet = new Map();
        reviews.forEach(review => {
            if (!reviewerSet.has(review.reviewerId)) {
                reviewerSet.set(review.reviewerId, review.reviewerName);
            }
        });
        return Array.from(reviewerSet.entries()).map(([id, name]) => ({ id, name }));
    }, [reviews]);

    if (displayUsers.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No participants to display
            </div>
        );
    }

    return (
        <div className="overflow-x-auto heatmap-scroll">
            <div className="min-w-max">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 bg-white dark:bg-slate-800 p-3 text-left font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-slate-600 min-w-[180px]">
                                Participant
                            </th>
                            {allReviewers.map((reviewer, idx) => (
                                <th
                                    key={reviewer.id}
                                    className="p-3 text-center font-semibold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-slate-600 min-w-[80px]"
                                >
                                    {showNames ? reviewer.name : `R${idx + 1}`}
                                </th>
                            ))}
                            <th className="p-3 text-center font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-slate-600 min-w-[100px] bg-blue-50 dark:bg-blue-900/20">
                                Average
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayUsers.map((user) => {
                            const userAvg = userAverages[user.id];

                            return (
                                <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-3 font-medium text-gray-900 dark:text-white">
                                        {user.name}
                                    </td>
                                    {allReviewers.map((reviewer) => {
                                        const reviewerData = userAvg?.reviewerScores[reviewer.id];
                                        const score = reviewerData ? Math.round(reviewerData.score) : 0;
                                        const colors = getScoreColor(score);

                                        return (
                                            <td key={reviewer.id} className="p-2">
                                                {score > 0 ? (
                                                    <div className={`
                            w-full h-12 flex items-center justify-center
                            rounded-lg font-bold text-lg
                            ${colors.bg} ${colors.text}
                          `}>
                                                        {reviewerData.score}
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
                                        {userAvg?.overallAverage ? (
                                            <div className="w-full h-12 flex items-center justify-center font-bold text-xl text-blue-700 dark:text-blue-400">
                                                {userAvg.overallAverage}
                                            </div>
                                        ) : (
                                            <div className="w-full h-12 flex items-center justify-center text-gray-400">
                                                -
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
