import { useState } from 'react';
import { useReviews } from '../../hooks/useReviews';
import { ComprehensiveGrid } from '../Grid/ComprehensiveGrid';
import { ScoreLegend } from '../Grid/ScoreLegend';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import { Filter, X } from 'lucide-react';

export const GridTab = ({ sessionId, activeUsers, session }) => {
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [showPeopleFilter, setShowPeopleFilter] = useState(false);
    const { reviews } = useReviews(sessionId);

    const categories = ['All Categories', ...EVALUATION_CONFIG.map(c => c.category)];

    const handleTogglePerson = (userId) => {
        if (filteredPeople.includes(userId)) {
            setFilteredPeople(filteredPeople.filter(id => id !== userId));
        } else {
            setFilteredPeople([...filteredPeople, userId]);
        }
    };

    const clearFilters = () => {
        setFilteredPeople([]);
    };

    return (
        <div className="space-y-6">
            {/* Score Legend */}
            <ScoreLegend />

            {/* Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                {/* Category Tabs */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${selectedCategory === category
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }
                `}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* People Filter */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Filter Participants
                        </h3>
                        <button
                            onClick={() => setShowPeopleFilter(!showPeopleFilter)}
                            className="btn-secondary text-sm flex items-center gap-2"
                        >
                            <Filter size={16} />
                            {showPeopleFilter ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {showPeopleFilter && (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {activeUsers.map((user) => {
                                    const isSelected = filteredPeople.includes(user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => handleTogglePerson(user.id)}
                                            className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isSelected
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                }
                      `}
                                        >
                                            {user.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredPeople.length > 0 && (
                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <span className="text-sm text-purple-700 dark:text-purple-400">
                                        {filteredPeople.length} participant{filteredPeople.length > 1 ? 's' : ''} selected
                                    </span>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 flex items-center gap-1"
                                    >
                                        <X size={16} />
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Comprehensive Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedCategory === 'All Categories' ? 'Overall Ratings' : selectedCategory}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredPeople.length > 0
                            ? `Showing ${filteredPeople.length} of ${activeUsers.length} participants`
                            : `Showing all ${activeUsers.length} participants`
                        }
                    </div>
                </div>

                <div id="heatmap-container">
                    <ComprehensiveGrid
                        reviews={reviews}
                        allUsers={activeUsers}
                        selectedCategory={selectedCategory}
                        filteredPeople={filteredPeople}
                        privacyMode={session?.privacyMode}
                        sessionStatus={session?.status}
                    />
                </div>

                {filteredPeople.length === 0 && reviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No reviews submitted yet
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">How to read the grid:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• <strong>Rows</strong>: Participants being rated</li>
                    <li>• <strong>Columns</strong>: Reviewers giving feedback</li>
                    <li>• <strong>Cells</strong>: Average score from that reviewer to that participant</li>
                    <li>• <strong>Average Column</strong>: Overall average across all reviewers</li>
                    {selectedCategory === 'All Categories' && (
                        <li>• <strong>All Categories</strong>: Shows average across all reviewed categories (excludes categories with no reviews)</li>
                    )}
                </ul>
            </div>
        </div>
    );
};
