/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Ray Dalio heatmap colors
                score: {
                    1: '#ef4444', // red-500
                    2: '#f97316', // orange-500
                    3: '#fbbf24', // amber-400
                    4: '#a3e635', // lime-400
                    5: '#10b981', // emerald-500
                    6: '#15803d', // green-700
                }
            }
        },
    },
    plugins: [],
}
