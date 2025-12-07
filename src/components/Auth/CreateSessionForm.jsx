import { useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Loader2 } from 'lucide-react';
import { EVALUATION_CONFIG } from '../../config/evaluationConfig';
import toast from 'react-hot-toast';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

export const CreateSessionForm = ({ onSessionCreated }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const generateSessionId = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleCreateSession = async () => {
        setLoading(true);

        try {
            const sessionId = generateSessionId();
            const sessionRef = doc(db, 'sessions', sessionId);

            // Create session document
            await setDoc(sessionRef, {
                sessionId,
                hostId: currentUser.uid,
                hostName: currentUser.email,
                activeCategory: EVALUATION_CONFIG[0].category,
                status: 'setup',
                privacyMode: 'reveal_at_end',
                createdAt: serverTimestamp()
            });

            // Update user document with sessionId
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                sessionId,
                name: currentUser.email.split('@')[0] // Use email prefix as name
            });

            onSessionCreated(sessionId);
        } catch (err) {
            console.error('Session creation error:', err);
            toast.error(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create New Session
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start a new feedback session for your participants
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    <div className="mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>What happens next:</strong>
                            </p>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
                                <li>• A unique 6-character code will be generated</li>
                                <li>• Share this code with your participants</li>
                                <li>• They can join using the code at the home page</li>
                                <li>• You'll manage the session from the dashboard</li>
                            </ul>
                        </div>
                    </div>


                    <button
                        onClick={handleCreateSession}
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Creating Session...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                Create Session
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
