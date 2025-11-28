/**
 * Get Ray Dalio style color classes for a score (1-6)
 * Returns object with background and text color classes
 */
export const getScoreColor = (score) => {
    const colorMap = {
        1: { bg: 'bg-red-500', text: 'text-white', hover: 'hover:bg-red-600' },
        2: { bg: 'bg-orange-500', text: 'text-white', hover: 'hover:bg-orange-600' },
        3: { bg: 'bg-amber-400', text: 'text-slate-900', hover: 'hover:bg-amber-500' },
        4: { bg: 'bg-lime-400', text: 'text-slate-900', hover: 'hover:bg-lime-500' },
        5: { bg: 'bg-emerald-500', text: 'text-white', hover: 'hover:bg-emerald-600' },
        6: { bg: 'bg-green-700', text: 'text-white', hover: 'hover:bg-green-800' }
    };

    return colorMap[score] || { bg: 'bg-gray-300', text: 'text-gray-700', hover: 'hover:bg-gray-400' };
};

/**
 * Get inline styles for a score (for PDF export)
 */
export const getScoreColorInline = (score) => {
    const colorMap = {
        1: { backgroundColor: '#ef4444', color: '#ffffff' },
        2: { backgroundColor: '#f97316', color: '#ffffff' },
        3: { backgroundColor: '#fbbf24', color: '#0f172a' },
        4: { backgroundColor: '#a3e635', color: '#0f172a' },
        5: { backgroundColor: '#10b981', color: '#ffffff' },
        6: { backgroundColor: '#15803d', color: '#ffffff' }
    };

    return colorMap[score] || { backgroundColor: '#d1d5db', color: '#374151' };
};
