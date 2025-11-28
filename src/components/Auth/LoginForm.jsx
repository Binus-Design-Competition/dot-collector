import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, Plus } from 'lucide-react';

export const LoginForm = ({ onSessionCreated }) => {
    const [name, setName] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const generateSessionCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Login first
            const user = await login(name);

            // Create new session
            const newSessionCode = generateSessionCode();
            const sessionRef = doc(db, 'sessions', newSessionCode);

            await setDoc(sessionRef, {
                hostId: user.uid,
                hostName: name,
                activeCategory: 'Delivery Dynamics',
                status: 'setup',
                privacyMode: 'reveal_at_end',
                createdAt: serverTimestamp()
            });

            // Update user with session
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                sessionId: newSessionCode,
                name,
                isOnline: true
            }, { merge: true });

            onSessionCreated(newSessionCode, true);
        } catch (err) {
            console.error('Error creating session:', err);
            setError('Failed to create session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!sessionCode.trim()) {
            setError('Please enter a session code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if session exists
            const sessionRef = doc(db, 'sessions', sessionCode.toUpperCase());
            const sessionSnap = await getDoc(sessionRef);

            if (!sessionSnap.exists()) {
                setError('Session not found. Please check the code.');
                setLoading(false);
                return;
            }

            // Login
            const user = await login(name, sessionCode.toUpperCase());

            // Update user with session
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                sessionId: sessionCode.toUpperCase(),
                name,
                isOnline: true
            }, { merge: true });

            onSessionCreated(sessionCode.toUpperCase(), false);
        } catch (err) {
            console.error('Error joining session:', err);
            setError('Failed to join session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Dot Collector
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Real-time peer feedback tool
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Enter your name"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {!isCreating ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Session Code
                                    </label>
                                    <input
                                        type="text"
                                        value={sessionCode}
                                        onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                                        placeholder="ABCDEF"
                                        maxLength={6}
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    onClick={handleJoinSession}
                                    disabled={loading || !name.trim() || !sessionCode.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    <LogIn size={20} />
                                    {loading ? 'Joining...' : 'Join Session'}
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">or</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <Plus size={20} />
                                    Create New Session
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleCreateSession}
                                    disabled={loading || !name.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    {loading ? 'Creating...' : 'Create Session (Teacher)'}
                                </button>

                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="w-full btn-secondary"
                                    disabled={loading}
                                >
                                    Back to Join
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
