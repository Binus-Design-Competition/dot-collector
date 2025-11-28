import { useState } from 'react';
import { VoteTab } from './VoteTab';
import { GridTab } from './GridTab';
import { MyFeedbackTab } from './MyFeedbackTab';
import { useAuth } from '../../hooks/useAuth';
import { ClipboardList, BarChart3, User, LogOut } from 'lucide-react';

export const StudentInterface = ({ sessionId, session, activeUsers }) => {
    const [activeTab, setActiveTab] = useState('vote');
    const { logout, userDoc } = useAuth();

    const tabs = [
        { id: 'vote', label: 'Vote', icon: ClipboardList },
        { id: 'grid', label: 'The Grid', icon: BarChart3 },
        { id: 'my-feedback', label: 'My Feedback', icon: User }
    ];

    const handleLogout = async () => {
        if (confirm('Are you sure you want to leave the session?')) {
            await logout();
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Dot Collector
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Session: {sessionId} • {userDoc?.name}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Leave
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors
                    ${isActive
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Session Status Banner */}
            {session && (
                <div className={`
          ${session.status === 'setup' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : ''}
          ${session.status === 'live' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : ''}
          ${session.status === 'closed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : ''}
          px-4 py-2 text-center text-sm font-medium
        `}>
                    {session.status === 'setup' && 'Waiting for teacher to start session...'}
                    {session.status === 'live' && `Session is LIVE • Current Category: ${session.activeCategory}`}
                    {session.status === 'closed' && 'Session has ended'}
                </div>
            )}

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'vote' && (
                    <VoteTab
                        sessionId={sessionId}
                        activeUsers={activeUsers}
                        sessionStatus={session?.status}
                    />
                )}
                {activeTab === 'grid' && (
                    <GridTab
                        sessionId={sessionId}
                        activeUsers={activeUsers}
                        session={session}
                    />
                )}
                {activeTab === 'my-feedback' && (
                    <MyFeedbackTab
                        sessionId={sessionId}
                        session={session}
                    />
                )}
            </div>
        </div>
    );
};
