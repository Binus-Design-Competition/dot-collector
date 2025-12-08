import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Globe, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlobeBackground } from '../UI/GlobeBackground';

export const UnifiedLogin = () => {
    const { loginWithGoogle, userDoc, currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('initial'); // 'initial', 'student_setup'
    const [sessionCode, setSessionCode] = useState('');

    useEffect(() => {
        if (currentUser) {
            // If already logged in, show student setup or redirect admin
            // This prevents "Hi Random" if you just refreshed the page with an old session
            if (userDoc?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                setViewMode('student_setup');
            }
        } else {
            setViewMode('initial');
        }
    }, [currentUser, userDoc, navigate]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            // multiple useEffects will handle the redirect/view change based on the result
        } catch (error) {
            console.error(error);
            toast.error('Failed to sign in with Google');
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setViewMode('initial');
        setSessionCode('');
    };

    const handleJoinSession = async (e) => {
        e.preventDefault();
        if (!sessionCode.trim()) {
            toast.error('Please enter a session code');
            return;
        }

        setIsLoading(true);
        try {
            const code = sessionCode.toUpperCase();
            const sessionRef = doc(db, 'sessions', code);
            const sessionSnap = await getDoc(sessionRef);

            if (!sessionSnap.exists()) {
                toast.error('Session not found');
                setIsLoading(false);
                return;
            }

            // Update user with session
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                sessionId: code,
                isOnline: true,
                lastActive: serverTimestamp()
            }, { merge: true });

            navigate('/room');
        } catch (error) {
            console.error(error);
            toast.error('Failed to join session');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-inter">
            {/* Background */}
            <GlobeBackground />

            {/* Content Container */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">

                {/* Glass Card */}
                <div className="w-full max-w-[400px] overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-500">
                    <div className="relative p-8">

                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[50px]"></div>

                        <div className="relative flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="mb-8 flex h-16 w-16 items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                                <Globe className="text-white w-8 h-8" strokeWidth={1.5} />
                            </div>

                            {/* Header */}
                            <h1 className="text-2xl font-medium tracking-tight text-white mb-2">
                                {viewMode === 'student_setup' && currentUser
                                    ? `Hi, ${currentUser.displayName?.split(' ')[0] || 'User'}`
                                    : 'Dot Collector'}
                            </h1>

                            <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-[280px]">
                                {viewMode === 'student_setup'
                                    ? 'Enter your session code below to join the classroom network.'
                                    : 'Helps teams share real-time feedback, rate ideas, and make better decisions'}
                            </p>

                            {viewMode === 'initial' && (
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="group w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span>Connecting...</span>
                                    ) : (
                                        <>
                                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {viewMode === 'student_setup' && (
                                <form onSubmit={handleJoinSession} className="w-full space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={sessionCode}
                                            onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                            placeholder="SESSION CODE"
                                            maxLength={6}
                                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-center text-lg tracking-[0.2em] text-white placeholder-zinc-700 focus:border-white/30 focus:bg-black/60 focus:outline-none transition-colors uppercase font-mono"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !sessionCode}
                                        className="w-full bg-white hover:bg-zinc-200 text-black px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span>Join Session</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="text-xs text-zinc-600 hover:text-zinc-400 mt-4 transition-colors"
                                    >
                                        Switch Account
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 flex gap-6 text-[10px] text-zinc-600 uppercase tracking-widest">
                    <span className="cursor-pointer hover:text-zinc-400 transition-colors">Privacy</span>
                    <span className="cursor-pointer hover:text-zinc-400 transition-colors">Terms</span>
                </div>
            </div>
        </div>
    );
};
