import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import { SegmentedControl } from './SegmentedControl';
import { Save, Edit2, ChevronDown } from 'lucide-react';

export const VoteTab = ({ sessionId, activeUsers, sessionStatus }) => {
    const { userDoc } = useAuth();
    const { createReview, updateReview, getMyReviews } = useReviews(sessionId);

    const [selectedCategory, setSelectedCategory] = useState(EVALUATION_CONFIG[0].category);
    const [selectedTarget, setSelectedTarget] = useState('');
    const [ratings, setRatings] = useState({});
    const [myReviews, setMyReviews] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const currentCategory = EVALUATION_CONFIG.find(c => c.category === selectedCategory);
    const availableTargets = activeUsers.filter(u => u.id !== userDoc?.id);

    // Load my submitted reviews
    useEffect(() => {
        if (userDoc?.id) {
            loadMyReviews();
        }
    }, [userDoc?.id, sessionId]);

    const loadMyReviews = async () => {
        if (!userDoc?.id) return;
        const reviews = await getMyReviews(userDoc.id);
        setMyReviews(reviews);
    };

    // Initialize ratings when selecting target or editing
    useEffect(() => {
        if (selectedTarget && selectedCategory) {
            // Check if editing existing review
            const existingReview = myReviews.find(
                r => r.targetUserId === selectedTarget && r.category === selectedCategory
            );

            if (existingReview) {
                setEditingReview(existingReview);
                setRatings(existingReview.ratings || {});
            } else {
                setEditingReview(null);
                // Initialize empty ratings
                const emptyRatings = {};
                currentCategory.metrics.forEach(m => {
                    emptyRatings[m.id] = 0;
                });
                setRatings(emptyRatings);
            }
        }
    }, [selectedTarget, selectedCategory, myReviews]);

    const handleRatingChange = (metricId, score) => {
        setRatings(prev => ({ ...prev, [metricId]: score }));
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all metrics are rated
        const allRated = currentCategory.metrics.every(m => ratings[m.id] && ratings[m.id] > 0);
        if (!allRated) {
            alert('Please rate all metrics before submitting');
            return;
        }

        setSaving(true);
        try {
            const targetUser = activeUsers.find(u => u.id === selectedTarget);

            const reviewData = {
                category: selectedCategory,
                reviewerId: userDoc.id,
                reviewerName: userDoc.name,
                targetUserId: selectedTarget,
                targetUserName: targetUser.name,
                ratings
            };

            if (editingReview) {
                await updateReview(editingReview.id, reviewData);
                setSuccessMessage('Review updated successfully!');
            } else {
                await createReview(reviewData);
                setSuccessMessage('Review submitted successfully!');
            }

            // Reload reviews
            await loadMyReviews();

            // Reset form
            setRatings({});
            setSelectedTarget('');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEditReview = (review) => {
        setSelectedCategory(review.category);
        setSelectedTarget(review.targetUserId);
        setEditingReview(review);
        setRatings(review.ratings);
    };

    const canEdit = sessionStatus !== 'closed';

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* My Submitted Reviews */}
            {myReviews.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">My Submitted Reviews</h3>
                    <div className="space-y-2">
                        {myReviews.map((review) => (
                            <div
                                key={review.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{review.targetUserName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.category}</p>
                                </div>
                                {canEdit && (
                                    <button
                                        onClick={() => handleEditReview(review)}
                                        className="btn-secondary text-sm flex items-center gap-1"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating Form */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {editingReview ? 'Edit Review' : 'Submit New Review'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            1. Select Category
                        </label>
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                disabled={!canEdit}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer disabled:opacity-50"
                            >
                                {EVALUATION_CONFIG.map((cat) => (
                                    <option key={cat.category} value={cat.category}>
                                        {cat.category}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>

                    {/* Target Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            2. Who are you rating?
                        </label>
                        <div className="relative">
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                disabled={!canEdit}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Select a person...</option>
                                {availableTargets.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>

                    {/* Metrics Rating */}
                    {selectedTarget && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                3. Rate Each Metric (1-6)
                            </label>

                            {currentCategory.metrics.map((metric) => (
                                <div key={metric.id} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                        {metric.label}
                                    </label>
                                    <SegmentedControl
                                        value={ratings[metric.id] || 0}
                                        onChange={(score) => handleRatingChange(metric.id, score)}
                                        disabled={!canEdit}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Button */}
                    {selectedTarget && canEdit && (
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : editingReview ? 'Update Review' : 'Submit Review'}
                        </button>
                    )}

                    {!canEdit && (
                        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg text-center">
                            Session has ended. Reviews can no longer be edited.
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
