import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { AdminLogin } from './components/Auth/AdminLogin';
import { CreateSessionForm } from './components/Auth/CreateSessionForm';
import { UserJoin } from './components/Auth/UserJoin';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { StudentInterface } from './components/Student/StudentInterface';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function AdminRoute() {
    const { currentUser, userDoc } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true' ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const sessionId = userDoc?.sessionId;
    const { session } = useSession(sessionId);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const isAdmin = currentUser && userDoc?.role === 'admin';

    if (!isAdmin) {
        return <AdminLogin onLoginSuccess={() => { }} />;
    }

    if (!sessionId) {
        return <CreateSessionForm onSessionCreated={() => { }} />;
    }

    return (
        <div className="relative">
            <button
                onClick={toggleDarkMode}
                className="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700"
                aria-label="Toggle dark mode"
            >
                {darkMode ? <Sun className="text-yellow-500" size={24} /> : <Moon className="text-slate-700" size={24} />}
            </button>
            <TeacherDashboard sessionId={sessionId} initialSession={session} />
        </div>
    );
}

function UserRoute() {
    const { currentUser, userDoc } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('darkMode') === 'true' ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const sessionId = userDoc?.sessionId;
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

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const isUser = currentUser && userDoc?.role === 'user' && sessionId;

    if (!isUser) {
        return <UserJoin onJoinSuccess={() => { }} />;
    }

    return (
        <div className="relative">
            <button
                onClick={toggleDarkMode}
                className="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700"
                aria-label="Toggle dark mode"
            >
                {darkMode ? <Sun className="text-yellow-500" size={24} /> : <Moon className="text-slate-700" size={24} />}
            </button>
            <StudentInterface sessionId={sessionId} session={session} activeUsers={activeUsers} />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/" element={<UserRoute />} />
                    <Route path="/admin" element={<AdminRoute />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
