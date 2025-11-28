import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { LoginForm } from './components/Auth/LoginForm';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { StudentInterface } from './components/Student/StudentInterface';
import { Moon, Sun } from 'lucide-react';

function AppContent() {
    const { currentUser, userDoc } = useAuth();
    const [sessionId, setSessionId] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true' ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const { session, activeUsers } = useSession(sessionId);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    useEffect(() => {
        if (userDoc?.sessionId) {
            setSessionId(userDoc.sessionId);
        }
    }, [userDoc]);

    const handleSessionCreated = (newSessionId, teacher) => {
        setSessionId(newSessionId);
        setIsTeacher(teacher);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Not logged in
    if (!currentUser || !userDoc) {
        return <LoginForm onSessionCreated={handleSessionCreated} />;
    }

    // Determine if user is teacher
    const userIsTeacher = session?.hostId === currentUser.uid || isTeacher;

    return (
        <div className="relative">
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <Sun className="text-yellow-500" size={24} />
                ) : (
                    <Moon className="text-slate-700" size={24} />
                )}
            </button>

            {/* Main Content */}
            {userIsTeacher ? (
                <TeacherDashboard
                    sessionId={sessionId}
                    initialSession={session}
                />
            ) : (
                <StudentInterface
                    sessionId={sessionId}
                    session={session}
                    activeUsers={activeUsers}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
