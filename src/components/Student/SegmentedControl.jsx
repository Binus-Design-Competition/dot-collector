import { getScoreColor } from '../../utils/colors';

export const SegmentedControl = ({ value, onChange, disabled = false }) => {
    const scores = [1, 2, 3, 4, 5, 6];

    return (
        <div className="flex gap-1 sm:gap-2">
            {scores.map((score) => {
                const colors = getScoreColor(score);
                const isSelected = value === score;

                return (
                    <button
                        key={score}
                        type="button"
                        onClick={() => onChange(score)}
                        disabled={disabled}
                        className={`
              flex-1 py-3 px-2 rounded-lg font-bold text-center
              transition-all duration-200
              ${isSelected ? `${colors.bg} ${colors.text} scale-105 shadow-lg` : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:scale-102'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            `}
                    >
                        {score}
                    </button>
                );
            })}
        </div>
    );
};
