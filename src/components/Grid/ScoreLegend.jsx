export const ScoreLegend = () => {
    const scores = [
        { value: 1, label: 'Very Poor', color: 'bg-red-500', textColor: 'text-white' },
        { value: 2, label: 'Poor', color: 'bg-orange-500', textColor: 'text-white' },
        { value: 3, label: 'Below Average', color: 'bg-amber-400', textColor: 'text-slate-900' },
        { value: 4, label: 'Good', color: 'bg-lime-400', textColor: 'text-slate-900' },
        { value: 5, label: 'Very Good', color: 'bg-emerald-500', textColor: 'text-white' },
        { value: 6, label: 'Excellent', color: 'bg-green-700', textColor: 'text-white' }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Score Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {scores.map((score) => (
                    <div key={score.value} className="flex items-center gap-2">
                        <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              font-bold text-sm ${score.color} ${score.textColor}
            `}>
                            {score.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {score.label}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 italic">
                💡 Scores range from 1 (needs improvement) to 6 (excellent). Colors indicate performance level.
            </p>
        </div>
    );
};
