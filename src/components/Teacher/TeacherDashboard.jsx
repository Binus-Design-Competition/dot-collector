import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSession } from '../../hooks/useSession';
import { useReviews } from '../../hooks/useReviews';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import { exportToPDF } from '../../utils/exportPdf';
import { HeatmapGrid } from '../Grid/HeatmapGrid';
import {
    Play,
    Square,
    Download,
    Users,
    LogOut,
    ChevronDown,
    Eye,
    EyeOff,
    Settings,
    X
} from 'lucide-react';

export const TeacherDashboard = ({ sessionId, initialSession }) => {
    const { logout, userDoc, updateDisplayName } = useAuth();
    const { session, activeUsers, updateActiveCategory, startSession, endSession, updateSession } = useSession(sessionId);
    const { reviews } = useReviews(sessionId);

    const [selectedCategory, setSelectedCategory] = useState(session?.activeCategory || EVALUATION_CONFIG[0].category);
    const [selectedTarget, setSelectedTarget] = useState('');
    const [exporting, setExporting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editingName, setEditingName] = useState('');

    const currentSession = session || initialSession;

    const handleCategoryChange = async (category) => {
        setSelectedCategory(category);
        await updateActiveCategory(category);
    };

    const handlePrivacyModeToggle = async () => {
        const newMode = currentSession.privacyMode === 'always_reveal' ? 'reveal_at_end' : 'always_reveal';
        await updateSession({ privacyMode: newMode });
    };

    const handleStartSession = async () => {
        if (confirm('Start the session? Students will be able to submit reviews.')) {
            await startSession();
        }
    };

    const handleEndSession = async () => {
        if (confirm('End the session? This will close submissions and reveal names if privacy mode is "Reveal at End".')) {
            await endSession();
        }
    };

    const handleExportPDF = async () => {
        if (!selectedTarget) {
            alert('Please select a target user to export their feedback');
            return;
        }

        setExporting(true);
        try {
            const targetUser = activeUsers.find(u => u.id === selectedTarget);
            const filename = `${targetUser?.name || 'feedback'}-${selectedCategory}-${new Date().toISOString().split('T')[0]}.pdf`;
            await exportToPDF('heatmap-container', filename);
        } catch (error) {
            alert('Failed to export PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const handleLogout = async () => {
        if (confirm('Are you sure you want to leave? The session will remain active.')) {
            await logout();
            window.location.reload();
        }
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        try {
            await updateDisplayName(editingName);
            setShowSettings(false);
            alert('Name updated successfully');
        } catch (error) {
            alert('Failed to update name');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
                            <p className="text-purple-100 mt-1">
                                Session Code: <span className="font-mono text-xl font-bold">{sessionId}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingName(userDoc?.name || '');
                                    setShowSettings(true);
                                }}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2"
                            >
                                <Settings size={18} />
                                Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2"
                            >
                                <LogOut size={18} />
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Control Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Session Status */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Session Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${currentSession?.status === 'setup' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${currentSession?.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${currentSession?.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                  `}>
                                        {currentSession?.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{activeUsers.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Reviews:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{reviews.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Mode */}
                        {currentSession?.status === 'setup' && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Privacy Mode</h3>
                                <button
                                    onClick={handlePrivacyModeToggle}
                                    className={`
                    w-full p-4 rounded-lg border-2 font-medium flex items-center justify-between
                    ${currentSession.privacyMode === 'always_reveal'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                        }
                  `}
                                >
                                    <span>
                                        {currentSession.privacyMode === 'always_reveal' ? (
                                            <>
                                                <Eye size={20} className="inline mr-2" />
                                                Always Reveal
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={20} className="inline mr-2" />
                                                Reveal at End
                                            </>
                                        )}
                                    </span>
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {currentSession.privacyMode === 'always_reveal'
                                        ? 'Reviewer names are visible throughout the session'
                                        : 'Reviewer names are hidden until session ends'
                                    }
                                </p>
                            </div>
                        )}

                        {/* Category Selector */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Active Category</h3>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    disabled={currentSession?.status === 'closed'}
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

                        {/* Session Controls */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow space-y-3">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Controls</h3>

                            {currentSession?.status === 'setup' && (
                                <button
                                    onClick={handleStartSession}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    <Play size={20} />
                                    Start Session
                                </button>
                            )}

                            {currentSession?.status === 'live' && (
                                <button
                                    onClick={handleEndSession}
                                    className="w-full btn-danger flex items-center justify-center gap-2"
                                >
                                    <Square size={20} />
                                    End Session
                                </button>
                            )}

                            <button
                                onClick={handleExportPDF}
                                disabled={!selectedTarget || exporting}
                                className="w-full btn-secondary flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                {exporting ? 'Exporting...' : 'Export PDF'}
                            </button>
                        </div>

                        {/* Active Users List */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users size={20} />
                                Active Participants ({activeUsers.length})
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {activeUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded-lg"
                                    >
                                        <span className="text-gray-900 dark:text-white">{user.name}</span>
                                        {user.id === currentSession?.hostId && (
                                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                                                Host
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Preview Heatmap</h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select User to Preview:
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedTarget}
                                        onChange={(e) => setSelectedTarget(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a person...</option>
                                        {activeUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>

                            {selectedTarget ? (
                                <div id="heatmap-container" className="bg-white dark:bg-slate-800 p-4">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        {activeUsers.find(u => u.id === selectedTarget)?.name} - {selectedCategory}
                                    </h4>
                                    <HeatmapGrid
                                        reviews={reviews}
                                        targetUserId={selectedTarget}
                                        category={selectedCategory}
                                        privacyMode={currentSession?.privacyMode}
                                        sessionStatus={currentSession?.status}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Select a user to preview their feedback
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateName} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
